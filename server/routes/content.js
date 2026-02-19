const express = require('express');
const router = express.Router();
const { getPlans, getTrainers, submitContact } = require('../controllers/contentController');

// @route   GET api/content/plans
// @desc    Get all plans
// @access  Public
router.get('/plans', getPlans);

// @route   GET api/content/trainers
// @desc    Get all trainers
// @access  Public
router.get('/trainers', getTrainers);

// @route   POST api/content/contact
// @desc    Submit contact form
// @access  Public
router.post('/contact', submitContact);

module.exports = router;
