const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validate, ctrl.register);
router.post('/login', authLimiter, loginValidator, validate, ctrl.login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, ctrl.resetPassword);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;