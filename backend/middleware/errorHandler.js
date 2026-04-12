const AppError = require('../utils/AppError');

const handleCastError = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`Duplicate value for '${field}'. Please use another value.`, 400);
};

const handleValidationError = (err) => {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation error: ${messages.join('. ')}`, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Token expired. Please log in again.', 401);
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // send clean error in prod
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (error.isOperational) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }

    // unknown error
    console.error('Unexpected Error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
    });
};

module.exports = globalErrorHandler;