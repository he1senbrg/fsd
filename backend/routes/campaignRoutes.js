const router = require('express').Router();
const ctrl = require('../controllers/campaignController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCampaignValidator } = require('../validators/campaignValidators');

router.get('/', ctrl.getCampaigns);
router.get('/stats', ctrl.getCampaignStats);
router.get('/top-funded', ctrl.getTopFunded);
router.get('/sponsor-tiers', ctrl.getSponsorTiers);
router.get('/:id', ctrl.getCampaign);
router.post('/', authenticate, createCampaignValidator, validate, ctrl.createCampaign);
router.put('/:id', authenticate, ctrl.updateCampaign);
router.delete('/:id', authenticate, ctrl.deleteCampaign);
router.post('/:id/publish', authenticate, ctrl.publishCampaign);
router.post('/:id/back', authenticate, ctrl.backCampaign);
router.get('/:id/backers', authenticate, ctrl.getBackers);

module.exports = router;