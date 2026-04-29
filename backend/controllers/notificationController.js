const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');


exports.getNotifications = catchAsync(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { notifications } });
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