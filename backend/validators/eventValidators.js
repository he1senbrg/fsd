const { body } = require('express-validator');

const createEventValidator = [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('category')
        .isIn([
            'performance', 'workshop', 'exhibition', 'festival',
            'competition', 'concert', 'culturalNight', 'craftFair', 'lectureDemo',
        ])
        .withMessage('Invalid event category'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('eventType')
        .optional()
        .isIn(['free', 'paid', 'inviteOnly'])
        .withMessage('Invalid event type'),
];

module.exports = { createEventValidator };