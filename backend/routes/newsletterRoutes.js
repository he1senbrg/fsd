const router = require('express').Router();
const ctrl = require('../controllers/newsletterController');

router.post('/subscribe', ctrl.subscribe);

module.exports = router;
