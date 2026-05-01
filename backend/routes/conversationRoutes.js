const router = require('express').Router();
const ctrl = require('../controllers/conversationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getConversations);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.post('/', authenticate, ctrl.createConversation);
router.get('/:id/messages', authenticate, ctrl.getMessages);
router.post('/:id/messages', authenticate, ctrl.sendMessage);
router.put('/:id/read', authenticate, ctrl.markRead);

module.exports = router;
