const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getWishlist);
router.post('/toggle', authenticate, ctrl.toggleWishlist);

module.exports = router;
