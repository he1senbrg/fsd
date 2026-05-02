const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/process', authenticate, ctrl.processPayment);
router.post('/refund', authenticate, ctrl.processRefund);
router.get('/history', authenticate, ctrl.getPaymentHistory);

module.exports = router;
