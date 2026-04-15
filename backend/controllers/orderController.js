const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');
const NotificationService = require('../services/NotificationService');

exports.getOrders = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const filter = { buyer: req.user._id };
    if (req.query.type) filter.orderType = req.query.type;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('items.product', 'name images')
            .populate('event', 'title startDate venue')
            .populate('campaign', 'title coverImage')
            .populate('seller', 'fullName')
            .sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);
    res.status(200).json({ status: 'success', data: { orders }, pagination: paginationMeta(total, page, limit) });
});

exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product', 'name images price')
        .populate('event', 'title startDate endDate venue')
        .populate('campaign', 'title coverImage')
        .populate('buyer', 'fullName email')
        .populate('seller', 'fullName email');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.buyer._id.toString() !== req.user._id.toString() &&
        order.seller?._id?.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    res.status(200).json({ status: 'success', data: { order } });
});

exports.getTracking = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    res.status(200).json({ status: 'success', data: { tracking: order.trackingInfo } });
});

exports.getTicket = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('event', 'title startDate endDate time venue')
        .populate('buyer', 'fullName email');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.orderType !== 'booking') return next(new AppError('Not a booking order', 400));
    res.status(200).json({
        status: 'success',
        data: {
            ticket: {
                orderId: order.orderId, event: order.event, attendee: order.buyer,
                ticketTier: order.ticketTier, paymentId: order.paymentId, bookedAt: order.createdAt,
            },
        },
    });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.buyer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    if (order.status !== 'processing') return next(new AppError('Only processing orders can be cancelled', 400));
    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ status: 'success', message: 'Order cancelled' });
});

exports.submitReview = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.buyer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    if (order.status !== 'delivered' && order.status !== 'confirmed') return next(new AppError('Cannot review this order', 400));

    const { rating, text } = req.body;
    const targetId = order.seller;
    const existing = await Review.findOne({ reviewer: req.user._id, target: targetId });
    if (existing) return next(new AppError('Already reviewed', 400));

    const review = await Review.create({
        reviewer: req.user._id, target: targetId, order: order._id, rating, text,
    });

    // update seller avg rating
    const reviews = await Review.find({ target: targetId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(targetId, { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });

    res.status(201).json({ status: 'success', data: { review } });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.seller.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    const { status } = req.body;
    const validTransitions = { processing: 'confirmed', confirmed: 'shipped', shipped: 'delivered' };
    if (validTransitions[order.status] !== status) return next(new AppError(`Cannot transition from ${order.status} to ${status}`, 400));
    order.status = status;
    await order.save();
    NotificationService.notifyOrderUpdate(order.buyer, order._id, status).catch(() => { });
    res.status(200).json({ status: 'success', data: { order } });
});

exports.updateTracking = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.seller.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    const { carrier, trackingNumber, estimatedDelivery } = req.body;
    order.trackingInfo = { carrier, trackingNumber, estimatedDelivery };
    await order.save();
    res.status(200).json({ status: 'success', data: { tracking: order.trackingInfo } });
});