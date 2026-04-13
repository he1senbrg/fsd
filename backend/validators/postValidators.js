const { body } = require('express-validator');

const createPostValidator = [
    body('text').optional().isString(),
    body('postType')
        .optional()
        .isIn(['general', 'performance', 'craft', 'workshop'])
        .withMessage('Invalid post type'),
];

const createCommentValidator = [
    body('text').trim().notEmpty().withMessage('Comment text is required'),
    body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID'),
];

module.exports = { createPostValidator, createCommentValidator };