const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadAvatar, uploadCover } = require('../middleware/upload');

// public/optional
router.get('/me/settings', authenticate, ctrl.getSettings);
router.get('/me/applications', authenticate, require('../controllers/opportunityController').getMyApplications);
router.get('/me/bookmarks', authenticate, require('../controllers/opportunityController').getMyBookmarks);

router.get('/:id', optionalAuth, ctrl.getUserProfile);
router.get('/:id/portfolio', ctrl.getUserPortfolio);
router.get('/:id/reviews', ctrl.getUserReviews);
router.post('/:id/reviews', authenticate, ctrl.addReview);
router.get('/:id/followers', optionalAuth, ctrl.getFollowers);
router.get('/:id/following', optionalAuth, ctrl.getFollowing);

// authenticated
router.post('/:id/follow', authenticate, ctrl.toggleFollow);
router.put('/me/profile', authenticate, ctrl.updateProfile);
router.put('/me/avatar', authenticate, uploadAvatar, ctrl.updateAvatar);
router.put('/me/cover', authenticate, uploadCover, ctrl.updateCover);
router.put('/me/password', authenticate, ctrl.updatePassword);
router.put('/me/notifications', authenticate, ctrl.updateNotificationPrefs);
router.put('/me/privacy', authenticate, ctrl.updatePrivacySettings);
router.post('/me/payment-method', authenticate, ctrl.addPaymentMethod);
router.put('/me/payout', authenticate, ctrl.updatePayoutDetails);
router.post('/me/verify', authenticate, ctrl.requestVerification);

module.exports = router;