const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const PaymentService = require('../services/PaymentService');
const { generateOrderId } = require('../utils/helpers');

// GET /api/cart
exports.getCart = catchAsync(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images stock seller');

    if (!cart) {
        cart = { user: req.user._id, items: [] };
    }

    res.status(200).json({
        status: 'success',
        data: { cart },
    });
});

// POST /api/cart/add
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [{ product: productId, quantity }],
        });
    } else {
        const existingItem = cart.items.find((i) => i.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
        await cart.save();
    }

    cart = await Cart.findById(cart._id).populate('items.product', 'name price images stock');

    res.status(200).json({
        status: 'success',
        data: { cart },
    });
});

// PUT /api/cart/:itemId (update qty)
exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
        return next(new AppError('Item not found in cart', 404));
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price images stock');

    res.status(200).json({
        status: 'success',
        data: { cart: updatedCart },
    });
});

// DELETE /api/cart/:itemId
exports.removeFromCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Item removed from cart',
    });
});

// POST /api/cart/checkout
exports.checkout = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty', 400));
    }

    // calc total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
        if (!item.product || !item.product.isActive) {
            return next(new AppError(`Product "${item.product?.name || 'Unknown'}" is no longer available`, 400));
        }
        if (item.product.stock < item.quantity) {
            return next(new AppError(`Insufficient stock for "${item.product.name}"`, 400));
        }

        const itemTotal = item.product.price * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
        });
    }

    const payment = await PaymentService.processPayment(totalAmount, req.user._id, 'purchase');
    const { platformFee } = PaymentService.calculateCommission(totalAmount);

    // create order
    const order = await Order.create({
        orderId: generateOrderId(),
        buyer: req.user._id,
        orderType: 'purchase',
        items: orderItems,
        seller: cart.items[0].product.seller,
        totalAmount,
        platformCommission: platformFee,
        status: 'confirmed',
        paymentId: payment.paymentId,
    });

    // - stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity },
        });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
        status: 'success',
        data: { order },
    });
});

// GET /api/wishlist
exports.getWishlist = catchAsync(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate('products', 'name price images rating seller category');

    if (!wishlist) {
        wishlist = { user: req.user._id, products: [] };
    }

    res.status(200).json({
        status: 'success',
        data: { wishlist },
    });
});

// POST /api/wishlist/toggle
exports.toggleWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: [productId],
        });
        return res.status(200).json({
            status: 'success',
            data: { wishlisted: true },
        });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
        wishlist.products.splice(index, 1);
        await wishlist.save();
        res.status(200).json({ status: 'success', data: { wishlisted: false } });
    } else {
        wishlist.products.push(productId);
        await wishlist.save();
        res.status(200).json({ status: 'success', data: { wishlisted: true } });
    }
});