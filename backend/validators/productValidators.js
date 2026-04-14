const { body } = require('express-validator');

const createProductValidator = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category')
        .isIn(['textiles', 'woodwork', 'jewelry', 'pottery', 'metalCrafts', 'paintings'])
        .withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description').optional().isString(),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const updateProductValidator = [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('category')
        .optional()
        .isIn(['textiles', 'woodwork', 'jewelry', 'pottery', 'metalCrafts', 'paintings'])
        .withMessage('Invalid category'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

module.exports = { createProductValidator, updateProductValidator };