const Event = require('../models/Event');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');
const PaymentService = require('../services/PaymentService');
const { generateOrderId } = require('../utils/helpers');

exports.getEvents = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const filter = { status: { $in: ['published', 'completed'] } };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.artForm) filter.artForm = { $regex: req.query.artForm, $options: 'i' };
    if (req.query.type) filter.eventType = req.query.type;
    if (req.query.location) filter.venue = { $regex: req.query.location, $options: 'i' };
    if (req.query.q) filter.$text = { $search: req.query.q };

    const [events, total] = await Promise.all([
        Event.find(filter).populate('organizer', 'fullName avatar').sort({ startDate: 1 }).skip(skip).limit(limit),
        Event.countDocuments(filter),
    ]);
    res.status(200).json({ status: 'success', data: { events }, pagination: paginationMeta(total, page, limit) });
});

exports.getUpcomingEvents = catchAsync(async (req, res) => {
    const events = await Event.find({ status: 'published', startDate: { $gte: new Date() } })
        .populate('organizer', 'fullName avatar').sort({ startDate: 1 }).limit(3);
    res.status(200).json({ status: 'success', data: { events } });
});

exports.getEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'fullName avatar title location');
    if (!event) return next(new AppError('Event not found', 404));
    res.status(200).json({ status: 'success', data: { event } });
});

exports.createEvent = catchAsync(async (req, res) => {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ status: 'success', data: { event } });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.organizer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: { event: updated } });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.organizer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    event.status = 'cancelled';
    await event.save();
    res.status(200).json({ status: 'success', message: 'Event cancelled' });
});

exports.publishEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.organizer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    res.status(200).json({ status: 'success', data: { event } });
});

exports.bookTicket = catchAsync(async (req, res, next) => {
    const { ticketTier, quantity = 1 } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.status !== 'published') return next(new AppError('Event not available', 400));

    let ticketPrice = 0;
    if (event.eventType === 'paid' && ticketTier) {
        const tier = event.ticketTiers.find((t) => t.name === ticketTier);
        if (!tier) return next(new AppError('Invalid ticket tier', 400));
        if (tier.soldQty + quantity > tier.totalQty) return next(new AppError('Not enough tickets', 400));
        ticketPrice = tier.price * quantity;
        tier.soldQty += quantity;
    }
    if (event.maxAttendees && event.attendeeCount + quantity > event.maxAttendees) {
        return next(new AppError('Event is fully booked', 400));
    }
    event.attendeeCount += quantity;
    await event.save();

    let paymentId = null;
    if (ticketPrice > 0) {
        const payment = await PaymentService.processPayment(ticketPrice, req.user._id, 'booking');
        paymentId = payment.paymentId;
    }
    const { platformFee } = PaymentService.calculateCommission(ticketPrice);

    const order = await Order.create({
        orderId: generateOrderId(), buyer: req.user._id, orderType: 'booking',
        event: event._id, ticketTier: ticketTier || 'General', seller: event.organizer,
        totalAmount: ticketPrice, platformCommission: platformFee, status: 'confirmed', paymentId,
    });
    res.status(201).json({ status: 'success', data: { order } });
});

exports.rsvpEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.eventType !== 'free') return next(new AppError('RSVP is only for free events', 400));
    if (event.maxAttendees && event.attendeeCount >= event.maxAttendees) return next(new AppError('Fully booked', 400));
    event.attendeeCount += 1;
    await event.save();
    const order = await Order.create({
        orderId: generateOrderId(), buyer: req.user._id, orderType: 'booking',
        event: event._id, ticketTier: 'Free', seller: event.organizer, totalAmount: 0, status: 'confirmed',
    });
    res.status(200).json({ status: 'success', data: { order } });
});

exports.getAttendees = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));
    if (event.organizer.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    const bookings = await Order.find({ event: event._id, orderType: 'booking' }).populate('buyer', 'fullName avatar email');
    const attendees = bookings.map((b) => ({ user: b.buyer, ticketTier: b.ticketTier, bookedAt: b.createdAt }));
    res.status(200).json({ status: 'success', data: { attendees, total: attendees.length } });
});