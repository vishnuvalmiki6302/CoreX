const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshAccessToken, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.post('/google', authLimiter, googleLogin);

module.exports = router;
