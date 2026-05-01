const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getOrders);
router.get('/:id', authenticate, ctrl.getOrder);
router.get('/:id/tracking', authenticate, ctrl.getTracking);
router.get('/:id/ticket', authenticate, ctrl.getTicket);
router.put('/:id/cancel', authenticate, ctrl.cancelOrder);
router.post('/:id/review', authenticate, ctrl.submitReview);
router.put('/:id/status', authenticate, ctrl.updateOrderStatus);
router.put('/:id/tracking', authenticate, ctrl.updateTracking);

module.exports = router;
