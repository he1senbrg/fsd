const User = require('../models/User');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const PaymentService = require('../services/PaymentService');
const { generateOrderId } = require('../utils/helpers');
const NotificationService = require('../services/NotificationService');

exports.getArtists = catchAsync(async (req, res) => {
    const filter = { role: 'artist' };
    if (req.query.artForm) filter.primaryArtForm = { $regex: req.query.artForm, $options: 'i' };
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.minRating) filter.rating = { $gte: Number(req.query.minRating) };
    if (req.query.q) filter.$text = { $search: req.query.q };

    let sort = { rating: -1, followerCount: -1 };
    if (req.query.sort === 'newest') sort = { createdAt: -1 };
    if (req.query.sort === 'rating') sort = { rating: -1 };
    if (req.query.sort === 'popular') sort = { followerCount: -1 };

    const artists = await User.find(filter).select('fullName avatar title location primaryArtForm specializations rating reviewCount verified followerCount pricing')
        .sort(sort);
    res.status(200).json({ status: 'success', data: { artists } });
});

exports.getFeaturedArtists = catchAsync(async (req, res) => {
    const artists = await User.find({ role: 'artist', verified: true })
        .select('fullName avatar title primaryArtForm rating reviewCount location')
        .sort({ rating: -1, followerCount: -1 }).limit(5);
    res.status(200).json({ status: 'success', data: { artists } });
});

exports.getAvailability = catchAsync(async (req, res) => {
    const slots = await AvailabilitySlot.find({
        artist: req.params.id,
        date: { $gte: new Date() },
    }).sort({ date: 1 });
    res.status(200).json({ status: 'success', data: { slots } });
});

exports.setAvailability = catchAsync(async (req, res) => {
    // [{ date, status }]
    const { dates } = req.body;
    const results = [];
    for (const item of dates) {
        const slot = await AvailabilitySlot.findOneAndUpdate(
            { artist: req.user._id, date: new Date(item.date) },
            { status: item.status },
            { upsert: true, new: true }
        );
        results.push(slot);
    }
    res.status(200).json({ status: 'success', data: { slots: results } });
});

exports.bookArtist = catchAsync(async (req, res, next) => {
    const { serviceType, date, message } = req.body;
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') return next(new AppError('Artist not found', 404));

    // check availability
    const slot = await AvailabilitySlot.findOne({ artist: artist._id, date: new Date(date) });
    if (slot && slot.status === 'booked') return next(new AppError('Artist is not available on this date', 400));

    // find pricing
    const pricing = artist.pricing?.find((p) => p.service === serviceType);
    const amount = pricing?.price || 0;

    let paymentId = null;
    if (amount > 0) {
        const payment = await PaymentService.processPayment(amount, req.user._id, 'booking');
        paymentId = payment.paymentId;
    }

    // mark slot booked
    await AvailabilitySlot.findOneAndUpdate(
        { artist: artist._id, date: new Date(date) },
        { status: 'booked' },
        { upsert: true }
    );

    const { platformFee } = PaymentService.calculateCommission(amount);
    const order = await Order.create({
        orderId: generateOrderId(), buyer: req.user._id, orderType: 'booking',
        seller: artist._id, totalAmount: amount, platformCommission: platformFee,
        status: 'confirmed', paymentId,
    });

    NotificationService.notifyBooking(artist._id, { serviceType, orderId: order._id }).catch(() => { });
    res.status(201).json({ status: 'success', data: { order } });
});