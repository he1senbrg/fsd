const router = require('express').Router();
const ctrl = require('../controllers/artistController');
const { authenticate } = require('../middleware/auth');

router.get('/', ctrl.getArtists);
router.get('/featured', ctrl.getFeaturedArtists);
router.get('/:id/availability', ctrl.getAvailability);
router.put('/me/availability', authenticate, ctrl.setAvailability);
router.post('/:id/book', authenticate, ctrl.bookArtist);

module.exports = router;
