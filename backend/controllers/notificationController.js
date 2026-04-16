const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');

exports.getNotifications = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const [notifications, total] = await Promise.all([
        Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments({ user: req.user._id }),
    ]);
    res.status(200).json({ status: 'success', data: { notifications }, pagination: paginationMeta(total, page, limit) });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.status(200).json({ status: 'success', data: { unreadCount: count } });
});

exports.markAllRead = catchAsync(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
});

exports.markRead = catchAsync(async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
});

exports.deleteNotification = catchAsync(async (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ status: 'success', message: 'Notification deleted' });
});

exports.clearAll = catchAsync(async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({ status: 'success', message: 'All notifications cleared' });
});