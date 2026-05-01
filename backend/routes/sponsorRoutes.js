const router = require('express').Router();
const ctrl = require('../controllers/campaignController');

router.get('/', ctrl.getSponsorTiers);

module.exports = router;
