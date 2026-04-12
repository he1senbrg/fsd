const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authenticated. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
});

const optionalAuth = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        } catch (err) {
            // token invalid
        }
    }

    next();
});

// rbac
// authorize('artist'), authorize('organizer', 'artist')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Not authenticated.', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    };
};

module.exports = { authenticate, optionalAuth, authorize };