const { body } = require('express-validator');

const createCampaignValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Campaign title is required')
        .isLength({ max: 60 })
        .withMessage('Title must be at most 60 characters'),
    body('category')
        .isIn(['visualArts', 'performingArts', 'textiles', 'heritage', 'music', 'education'])
        .withMessage('Invalid campaign category'),
    body('goalAmount').isFloat({ min: 1 }).withMessage('Goal amount must be at least ₹1'),
    body('duration')
        .isIn([15, 30, 45, 60])
        .withMessage('Duration must be 15, 30, 45, or 60 days'),
];

module.exports = { createCampaignValidator };