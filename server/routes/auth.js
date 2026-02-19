const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logoutUser);

// @route   POST api/auth/google
// @desc    Login with Google
// @access  Public
router.post('/google', require('../controllers/authController').googleLogin);

module.exports = router;
