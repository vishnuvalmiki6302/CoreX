const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');
const Class = require('../models/Class');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Populate trainer details
        const classes = await Class.find({}).populate('trainer', 'username email');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a class session
// @route   POST /api/classes
// @access  Private/Admin
router.post('/', protect, isAdmin, async (req, res) => {
    try {
        const { name, description, trainerId, startTime, durationMinutes, capacity } = req.body;

        const newClass = new Class({
            name,
            description,
            trainer: trainerId || req.user._id, // Default to creator if no trainer specified
            startTime,
            durationMinutes,
            capacity
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Book a class
// @route   POST /api/classes/:id/book
// @access  Private
router.post('/:id/book', protect, async (req, res) => {
    try {
        const classSession = await Class.findById(req.params.id);

        if (!classSession) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if already booked
        if (classSession.enrolledUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already booked for this class' });
        }

        // Check capacity
        if (classSession.enrolledUsers.length >= classSession.capacity) {
            return res.status(400).json({ message: 'Class is full' });
        }

        classSession.enrolledUsers.push(req.user._id);
        await classSession.save();

        res.json({ message: 'Booking successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
