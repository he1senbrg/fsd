const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createProductValidator, updateProductValidator } = require('../validators/productValidators');

router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/collections/:slug', ctrl.getCollection);
router.get('/:id', ctrl.getProduct);
router.post('/', authenticate, uploadProductImages, createProductValidator, validate, ctrl.createProduct);
router.put('/:id', authenticate, updateProductValidator, validate, ctrl.updateProduct);
router.delete('/:id', authenticate, ctrl.deleteProduct);

module.exports = router;