const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getCart);
router.post('/add', authenticate, ctrl.addToCart);
router.put('/:itemId', authenticate, ctrl.updateCartItem);
router.delete('/:itemId', authenticate, ctrl.removeFromCart);
router.post('/checkout', authenticate, ctrl.checkout);

module.exports = router;
