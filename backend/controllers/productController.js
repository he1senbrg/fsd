const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');
const { uploadBuffer } = require('../utils/blobStorage');

// GET /api/products (list with filters)
exports.getProducts = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.region) filter.region = req.query.region;
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.q) {
        filter.$text = { $search: req.query.q };
    }

    let sort = { createdAt: -1 };
    switch (req.query.sort) {
        case 'popularity':
            sort = { rating: -1, reviewCount: -1 };
            break;
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'priceLow':
            sort = { price: 1 };
            break;
        case 'priceHigh':
            sort = { price: -1 };
            break;
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('seller', 'fullName avatar location')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        status: 'success',
        data: { products },
        pagination: paginationMeta(total, page, limit),
    });
});

// 4 featured items for landing page
// GET /api/products/featured 
exports.getFeaturedProducts = catchAsync(async (req, res) => {
    const products = await Product.find({ isActive: true })
        .populate('seller', 'fullName avatar')
        .sort({ rating: -1, reviewCount: -1 })
        .limit(4);

    res.status(200).json({
        status: 'success',
        data: { products },
    });
});

// GET /api/products/:id (product info)
exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('seller', 'fullName avatar location rating reviewCount');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// POST /api/products (create pdt listing)
exports.createProduct = catchAsync(async (req, res) => {
    const { name, description, category, price, originalPrice, region, stock, badge } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadBuffer(file.buffer, file.mimetype, 'products');
            images.push(result.url);
        }
    }

    const product = await Product.create({
        seller: req.user._id,
        name,
        description,
        category,
        price,
        originalPrice,
        images,
        region,
        stock,
        badge,
    });

    res.status(201).json({
        status: 'success',
        data: { product },
    });
});

// PUT /api/products/:id (update pdt)
exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    if (product.seller.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only update your own products', 403));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: { product: updated },
    });
});

// DELETE /api/products/:id
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    if (product.seller.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only delete your own products', 403));
    }

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
        status: 'success',
        message: 'Product removed',
    });
});

// GET /api/products/collections/:slug — (featured collection)
exports.getCollection = catchAsync(async (req, res) => {
    const { slug } = req.params;
    let filter = { isActive: true };

    const collectionMap = {
        'heritage-handlooms': { category: 'textiles' },
        'artisan-jewelry': { category: 'jewelry' },
        'wood-crafts': { category: 'woodwork' },
        'pottery-ceramics': { category: 'pottery' },
        'metal-crafts': { category: 'metalCrafts' },
        'paintings-art': { category: 'paintings' },
    };

    if (collectionMap[slug]) {
        filter = { ...filter, ...collectionMap[slug] };
    }

    const products = await Product.find(filter)
        .populate('seller', 'fullName avatar')
        .sort({ rating: -1 })
        .limit(12);

    res.status(200).json({
        status: 'success',
        data: { collection: slug, products },
    });
});