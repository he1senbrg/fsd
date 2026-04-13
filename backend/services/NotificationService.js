const Notification = require('../models/Notification');
let io;
const setIO = (socketIO) => {
    io = socketIO;
};

// create notification and send it via socket.IO if user online
const createNotification = async ({ user, type, message, relatedEntity }) => {
    const notification = await Notification.create({
        user,
        type,
        message,
        relatedEntity,
    });

    if (io) {
        io.to(`user:${user}`).emit('notification:new', notification);
    }

    return notification;
};

const notifyLike = async (postId, likerId, postAuthorId, likerName) => {
    if (likerId.toString() === postAuthorId.toString()) return; // Don't self-notify
    return createNotification({
        user: postAuthorId,
        type: 'like',
        message: `${likerName} liked your post`,
        relatedEntity: { entityType: 'Post', entityId: postId },
    });
};

const notifyComment = async (postId, commenterId, postAuthorId, commenterName) => {
    if (commenterId.toString() === postAuthorId.toString()) return;
    return createNotification({
        user: postAuthorId,
        type: 'comment',
        message: `${commenterName} commented on your post`,
        relatedEntity: { entityType: 'Post', entityId: postId },
    });
};

const notifyFollow = async (followeeId, followerId, followerName) => {
    return createNotification({
        user: followeeId,
        type: 'follow',
        message: `${followerName} started following you`,
        relatedEntity: { entityType: 'User', entityId: followerId },
    });
};

const notifyBooking = async (artistId, bookingDetails) => {
    return createNotification({
        user: artistId,
        type: 'booking',
        message: `New booking request: ${bookingDetails.serviceType}`,
        relatedEntity: { entityType: 'Order', entityId: bookingDetails.orderId },
    });
};

const notifyOrderUpdate = async (buyerId, orderId, newStatus) => {
    return createNotification({
        user: buyerId,
        type: 'order',
        message: `Your order has been ${newStatus}`,
        relatedEntity: { entityType: 'Order', entityId: orderId },
    });
};

const notifyCampaignMilestone = async (creatorId, campaignId, milestone) => {
    return createNotification({
        user: creatorId,
        type: 'campaign',
        message: `Your campaign reached ${milestone}`,
        relatedEntity: { entityType: 'Campaign', entityId: campaignId },
    });
};

const notifyApplicationStatus = async (applicantId, opportunityId, status) => {
    return createNotification({
        user: applicantId,
        type: 'event',
        message: `Your application has been ${status}`,
        relatedEntity: { entityType: 'Opportunity', entityId: opportunityId },
    });
};

module.exports = {
    setIO,
    createNotification,
    notifyLike,
    notifyComment,
    notifyFollow,
    notifyBooking,
    notifyOrderUpdate,
    notifyCampaignMilestone,
    notifyApplicationStatus,
};