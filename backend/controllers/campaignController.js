const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');
const PaymentService = require('../services/PaymentService');
const { generateOrderId } = require('../utils/helpers');
const NotificationService = require('../services/NotificationService');

exports.getCampaigns = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $in: ['active', 'funded'] };

    let sort = { createdAt: -1 };
    if (req.query.sort === 'mostFunded') sort = { raisedAmount: -1 };
    if (req.query.sort === 'endingSoon') sort = { deadline: 1 };
    if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const [campaigns, total] = await Promise.all([
        Campaign.find(filter).populate('creator', 'fullName avatar').sort(sort).skip(skip).limit(limit),
        Campaign.countDocuments(filter),
    ]);
    res.status(200).json({ status: 'success', data: { campaigns }, pagination: paginationMeta(total, page, limit) });
});

exports.getCampaignStats = catchAsync(async (req, res) => {
    const [totalFunded, campaignCount, totalBackers] = await Promise.all([
        Campaign.aggregate([{ $match: { status: 'funded' } }, { $group: { _id: null, total: { $sum: '$raisedAmount' } } }]),
        Campaign.countDocuments({ status: { $in: ['active', 'funded'] } }),
        Contribution.distinct('backer'),
    ]);
    const funded = await Campaign.countDocuments({ status: 'funded' });
    const allFinished = await Campaign.countDocuments({ status: { $in: ['funded', 'failed'] } });
    res.status(200).json({
        status: 'success',
        data: {
            totalFunded: totalFunded[0]?.total || 0,
            campaignCount,
            backerCount: totalBackers.length,
            successRate: allFinished > 0 ? Math.round((funded / allFinished) * 100) : 0,
        },
    });
});

exports.getTopFunded = catchAsync(async (req, res) => {
    const campaigns = await Campaign.find({ status: { $in: ['active', 'funded'] } })
        .populate('creator', 'fullName avatar').sort({ raisedAmount: -1 }).limit(2);
    res.status(200).json({ status: 'success', data: { campaigns } });
});

exports.getCampaign = catchAsync(async (req, res, next) => {
    const campaign = await Campaign.findById(req.params.id).populate('creator', 'fullName avatar title location');
    if (!campaign) return next(new AppError('Campaign not found', 404));
    res.status(200).json({ status: 'success', data: { campaign } });
});

exports.createCampaign = catchAsync(async (req, res) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (req.body.duration || 30));
    const campaign = await Campaign.create({ ...req.body, creator: req.user._id, deadline });
    res.status(201).json({ status: 'success', data: { campaign } });
});

exports.updateCampaign = catchAsync(async (req, res, next) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return next(new AppError('Not found', 404));
    if (campaign.creator.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    if (campaign.status !== 'draft') return next(new AppError('Can only edit draft campaigns', 400));
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: { campaign: updated } });
});

exports.publishCampaign = catchAsync(async (req, res, next) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return next(new AppError('Not found', 404));
    if (campaign.creator.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    if (campaign.status !== 'draft') return next(new AppError('Only draft campaigns can be published', 400));
    campaign.status = 'active';
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (campaign.duration || 30));
    campaign.deadline = deadline;
    await campaign.save();
    res.status(200).json({ status: 'success', data: { campaign } });
});

exports.backCampaign = catchAsync(async (req, res, next) => {
    const { amount, rewardTier } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return next(new AppError('Not found', 404));
    if (campaign.status !== 'active') return next(new AppError('Campaign is not active', 400));
    if (!amount || amount < 1) return next(new AppError('Amount must be at least ₹1', 400));

    const payment = await PaymentService.processPayment(amount, req.user._id, 'crowdfunding');

    const contribution = await Contribution.create({
        campaign: campaign._id, backer: req.user._id, amount,
        rewardTier: rewardTier || '', paymentId: payment.paymentId,
    });

    campaign.raisedAmount += amount;
    campaign.backerCount += 1;
    await campaign.save();

    // make crowdfunding order
    const { platformFee } = PaymentService.calculateCommission(amount);
    await Order.create({
        orderId: generateOrderId(), buyer: req.user._id, orderType: 'crowdfunding',
        campaign: campaign._id, seller: campaign.creator, totalAmount: amount,
        platformCommission: platformFee, status: 'confirmed', paymentId: payment.paymentId,
    });

    // milestone notifications
    const percent = Math.floor((campaign.raisedAmount / campaign.goalAmount) * 100);
    if ([25, 50, 75, 100].includes(percent)) {
        NotificationService.notifyCampaignMilestone(campaign.creator, campaign._id, `${percent}% of its goal!`).catch(() => { });
    }

    res.status(201).json({ status: 'success', data: { contribution } });
});

exports.getBackers = catchAsync(async (req, res, next) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return next(new AppError('Not found', 404));
    if (campaign.creator.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    const contributions = await Contribution.find({ campaign: campaign._id })
        .populate('backer', 'fullName avatar').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { backers: contributions } });
});

exports.getSponsorTiers = catchAsync(async (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tiers: [
                { name: 'Rasa', amount: 500, benefits: ['Thank you note', 'Name in credits'] },
                { name: 'Kala', amount: 2000, benefits: ['All Rasa benefits', 'Exclusive updates', 'Early access'] },
                { name: 'Guru', amount: 5000, benefits: ['All Kala benefits', 'Meet the artist', 'Limited edition artwork'] },
            ],
        },
    });
});