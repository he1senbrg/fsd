const { Conversation, Message } = require('../models/Conversation');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');


exports.getConversations = catchAsync(async (req, res) => {
    const filter = { participants: req.user._id };
    if (req.query.tab) filter.tab = req.query.tab;

    const conversations = await Conversation.find(filter)
        .populate('participants', 'fullName avatar')
        .sort({ lastMessageAt: -1 });

    // add unread counts
    const convosWithUnread = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversation: conv._id,
                readBy: { $ne: req.user._id },
                sender: { $ne: req.user._id },
            });
            return { ...conv.toObject(), unreadCount };
        })
    );

    res.status(200).json({ status: 'success', data: { conversations: convosWithUnread } });
});

exports.createConversation = catchAsync(async (req, res, next) => {
    const { recipientId, message } = req.body;
    if (recipientId === req.user._id.toString()) return next(new AppError('Cannot message yourself', 400));

    // check if conv already exists
    let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [req.user._id, recipientId],
            lastMessage: message,
            lastMessageAt: new Date(),
            tab: 'primary',
        });
    }

    if (message) {
        await Message.create({
            conversation: conversation._id,
            sender: req.user._id,
            text: message,
            readBy: [req.user._id],
        });
        conversation.lastMessage = message;
        conversation.lastMessageAt = new Date();
        await conversation.save();
    }

    const populated = await Conversation.findById(conversation._id)
        .populate('participants', 'fullName avatar');

    res.status(201).json({ status: 'success', data: { conversation: populated } });
});

exports.getMessages = catchAsync(async (req, res) => {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ status: 'fail', message: 'Conversation not found' });
    if (!conv.participants.includes(req.user._id)) {
        return res.status(403).json({ status: 'fail', message: 'Not a participant' });
    }

    const messages = await Message.find({ conversation: req.params.id })
        .populate('sender', 'fullName avatar')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        data: { messages: messages.reverse() },
    });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return next(new AppError('Conversation not found', 404));
    if (!conv.participants.includes(req.user._id)) return next(new AppError('Not a participant', 403));

    const message = await Message.create({
        conversation: conv._id,
        sender: req.user._id,
        text: req.body.text,
        attachments: req.body.attachments || [],
        readBy: [req.user._id],
    });

    conv.lastMessage = req.body.text;
    conv.lastMessageAt = new Date();
    await conv.save();

    const populated = await Message.findById(message._id).populate('sender', 'fullName avatar');

    // send via socketio
    try {
        const { getIO } = require('../config/socketio');
        const io = getIO();
        io.to(`conversation:${conv._id}`).emit('message:new', populated);
    } catch (e) { /* not init */ }

    res.status(201).json({ status: 'success', data: { message: populated } });
});

exports.markRead = catchAsync(async (req, res) => {
    await Message.updateMany(
        { conversation: req.params.id, readBy: { $ne: req.user._id } },
        { $addToSet: { readBy: req.user._id } }
    );
    res.status(200).json({ status: 'success', message: 'Messages marked as read' });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
    // all messages where usr is a there but not read them
    const conversations = await Conversation.find({ participants: req.user._id }).select('_id');
    const convIds = conversations.map(c => c._id);
    const unreadCount = await Message.countDocuments({
        conversation: { $in: convIds },
        readBy: { $ne: req.user._id },
        sender: { $ne: req.user._id },
    });
    res.status(200).json({ status: 'success', data: { unreadCount } });
});