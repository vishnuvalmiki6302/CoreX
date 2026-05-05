const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        // Only use secure cookies if NOT explicitly disabled (needed for AWS HTTP)
        secure: process.env.DISABLE_SECURE_COOKIES === 'true' ? false : true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

module.exports = generateToken;
