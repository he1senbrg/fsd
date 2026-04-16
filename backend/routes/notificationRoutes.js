const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getNotifications);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.put('/mark-all-read', authenticate, ctrl.markAllRead);
router.put('/:id/read', authenticate, ctrl.markRead);
router.delete('/:id', authenticate, ctrl.deleteNotification);
router.delete('/', authenticate, ctrl.clearAll);

module.exports = router;