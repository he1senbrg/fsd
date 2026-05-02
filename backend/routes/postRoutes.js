const router = require('express').Router();
const ctrl = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createPostValidator, createCommentValidator } = require('../validators/postValidators');

router.get('/', authenticate, ctrl.getPosts);
router.post('/', authenticate, uploadMedia, createPostValidator, validate, ctrl.createPost);
router.get('/:id', optionalAuth, ctrl.getPost);
router.delete('/:id', authenticate, ctrl.deletePost);
router.post('/:id/like', authenticate, ctrl.toggleLike);
router.get('/:id/comments', optionalAuth, ctrl.getComments);
router.post('/:id/comments', authenticate, createCommentValidator, validate, ctrl.addComment);
router.post('/:id/share', authenticate, ctrl.sharePost);

module.exports = router;
