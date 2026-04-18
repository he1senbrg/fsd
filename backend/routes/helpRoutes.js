const router = require('express').Router();
const ctrl = require('../controllers/helpController');
const { optionalAuth } = require('../middleware/auth');

router.get('/faqs', ctrl.getFaqs);
router.get('/categories', ctrl.getCategories);
router.post('/contact', optionalAuth, ctrl.submitTicket);

module.exports = router;