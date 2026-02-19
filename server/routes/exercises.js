const express = require('express');
const router = express.Router();
const { getExercises, getExerciseById, createExercise } = require('../controllers/exerciseController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/exercises
// @desc    Get all exercises or filter by bodyPart
// @access  Public
router.get('/', getExercises);

// @route   GET api/exercises/:id
// @desc    Get exercise by ID
// @access  Public
router.get('/:id', getExerciseById);

// @route   POST api/exercises
// @desc    Add new exercise
// @access  Private (Protected by auth)
router.post('/', auth.protect, createExercise);

module.exports = router;
