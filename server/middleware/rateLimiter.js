const rateLimit = require('express-rate-limit');

// Helper to create a bypassable limiter
const createLimiter = (options) => {
    if (process.env.NODE_ENV !== 'production') {
        return (req, res, next) => next();
    }
    return rateLimit(options);
};

/**
 * Auth rate limiter
 */
const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AI rate limiter
 */
const aiLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: {
        message: 'Too many AI requests. Please wait before trying again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API limiter
 */
const generalLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        message: 'Too many requests. Please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, aiLimiter, generalLimiter };
