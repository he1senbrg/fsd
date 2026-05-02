const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const { authenticate } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post('/upload', authenticate, uploadLimiter, uploadSingleImage, ctrl.uploadMedia);
router.delete('/:publicId', authenticate, ctrl.deleteMedia);

module.exports = router;
