const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';
const skipInDev = () => isDev;

// general: 100 per minute
const generalLimiter = rateLimit({
  skip: skipInDev,
  windowMs: 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// auth: 5 per minute
const authLimiter = rateLimit({
  skip: skipInDev,
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// upload: 10 per minute
const uploadLimiter = rateLimit({
  skip: skipInDev,
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'fail',
    message: 'Too many upload requests. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };
