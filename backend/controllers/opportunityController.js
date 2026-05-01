const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Bookmark = require('../models/Bookmark');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const NotificationService = require('../services/NotificationService');

exports.getOpportunities = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.artForm) filter.artForm = { $regex: req.query.artForm, $options: 'i' };
  if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
  if (req.query.isRemote) filter.isRemote = req.query.isRemote === 'true';
  if (req.query.status) filter.status = req.query.status;
  else filter.status = 'open';
  if (req.query.payMin || req.query.payMax) {
    filter['payAmount.min'] = {};
    if (req.query.payMin) filter['payAmount.min'].$gte = Number(req.query.payMin);
    if (req.query.payMax) filter['payAmount.max'] = { $lte: Number(req.query.payMax) };
  }
  if (req.query.q)
    filter.$or = [
      { title: { $regex: req.query.q, $options: 'i' } },
      { description: { $regex: req.query.q, $options: 'i' } },
    ];

  let sort = { createdAt: -1 };
  if (req.query.sort === 'deadline') sort = { deadline: 1 };
  if (req.query.sort === 'payHigh') sort = { 'payAmount.max': -1 };

  const opps = await Opportunity.find(filter).populate('organizer', 'fullName avatar').sort(sort);
  res.status(200).json({ status: 'success', data: { opportunities: opps } });
});

exports.getTrendingOpportunities = catchAsync(async (req, res) => {
  const opps = await Opportunity.find({ status: 'open' })
    .populate('organizer', 'fullName avatar')
    .sort({ applicationCount: -1 })
    .limit(3);
  res.status(200).json({ status: 'success', data: { opportunities: opps } });
});

exports.getOpportunity = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id).populate(
    'organizer',
    'fullName avatar title location',
  );
  if (!opp) return next(new AppError('Opportunity not found', 404));
  let hasApplied = false,
    isBookmarked = false;
  if (req.user) {
    const app = await Application.findOne({ opportunity: opp._id, applicant: req.user._id });
    hasApplied = !!app;
    const bm = await Bookmark.findOne({ user: req.user._id, opportunity: opp._id });
    isBookmarked = !!bm;
  }
  res
    .status(200)
    .json({
      status: 'success',
      data: { opportunity: { ...opp.toObject(), hasApplied, isBookmarked } },
    });
});

exports.createOpportunity = catchAsync(async (req, res) => {
  const opp = await Opportunity.create({ ...req.body, organizer: req.user._id });
  res.status(201).json({ status: 'success', data: { opportunity: opp } });
});

exports.updateOpportunity = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  if (opp.organizer.toString() !== req.user._id.toString())
    return next(new AppError('Not authorized', 403));
  const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { opportunity: updated } });
});

exports.deleteOpportunity = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  if (opp.organizer.toString() !== req.user._id.toString())
    return next(new AppError('Not authorized', 403));
  await Opportunity.deleteOne({ _id: opp._id });
  res.status(200).json({ status: 'success', message: 'Opportunity removed' });
});

exports.applyToOpportunity = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  if (opp.status !== 'open') return next(new AppError('Applications closed', 400));
  const existing = await Application.findOne({ opportunity: opp._id, applicant: req.user._id });
  if (existing) return next(new AppError('Already applied', 400));
  const application = await Application.create({
    opportunity: opp._id,
    applicant: req.user._id,
    coverLetter: req.body.coverLetter || '',
  });
  await Opportunity.findByIdAndUpdate(opp._id, { $inc: { applicationCount: 1 } });
  res.status(201).json({ status: 'success', data: { application } });
});

exports.getApplications = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  if (opp.organizer.toString() !== req.user._id.toString())
    return next(new AppError('Not authorized', 403));
  const apps = await Application.find({ opportunity: opp._id }).populate(
    'applicant',
    'fullName avatar title primaryArtForm rating reviewCount',
  );
  res.status(200).json({ status: 'success', data: { applications: apps } });
});

exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  if (opp.organizer.toString() !== req.user._id.toString())
    return next(new AppError('Not authorized', 403));
  const app = await Application.findById(req.params.appId);
  if (!app) return next(new AppError('Application not found', 404));
  app.status = req.body.status;
  await app.save();
  NotificationService.notifyApplicationStatus(app.applicant, opp._id, req.body.status).catch(
    () => {},
  );
  res.status(200).json({ status: 'success', data: { application: app } });
});

exports.getMyApplications = catchAsync(async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id })
    .populate('opportunity')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { applications: apps } });
});

exports.toggleBookmark = catchAsync(async (req, res, next) => {
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) return next(new AppError('Not found', 404));
  const existing = await Bookmark.findOne({ user: req.user._id, opportunity: opp._id });
  if (existing) {
    await Bookmark.deleteOne({ _id: existing._id });
    res.status(200).json({ status: 'success', data: { bookmarked: false } });
  } else {
    await Bookmark.create({ user: req.user._id, opportunity: opp._id });
    res.status(200).json({ status: 'success', data: { bookmarked: true } });
  }
});

exports.getMyBookmarks = catchAsync(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).populate('opportunity');
  const opportunities = bookmarks.map((b) => b.opportunity);
  res.status(200).json({ status: 'success', data: { opportunities } });
});
