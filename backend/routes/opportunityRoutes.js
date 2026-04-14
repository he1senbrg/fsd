const router = require('express').Router();
const ctrl = require('../controllers/opportunityController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', ctrl.getOpportunities);
router.get('/trending', authenticate, ctrl.getTrendingOpportunities);
router.get('/:id', optionalAuth, ctrl.getOpportunity);
router.post('/', authenticate, ctrl.createOpportunity);
router.put('/:id', authenticate, ctrl.updateOpportunity);
router.delete('/:id', authenticate, ctrl.deleteOpportunity);
router.post('/:id/apply', authenticate, ctrl.applyToOpportunity);
router.get('/:id/applications', authenticate, ctrl.getApplications);
router.put('/:id/applications/:appId', authenticate, ctrl.updateApplicationStatus);
router.post('/:id/bookmark', authenticate, ctrl.toggleBookmark);

module.exports = router;