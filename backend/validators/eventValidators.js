const { body } = require('express-validator');

const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('category')
    .isIn([
      'performance',
      'workshop',
      'exhibition',
      'festival',
      'competition',
      'concert',
      'culturalNight',
      'craftFair',
      'lectureDemo',
    ])
    .withMessage('Invalid event category'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('eventType').optional().isIn(['free', 'paid']).withMessage('Invalid event type'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('totalQty').optional().isNumeric().withMessage('Total quantity must be a number'),
];

module.exports = { createEventValidator };
