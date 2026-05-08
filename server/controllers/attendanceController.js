const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Check-in a user
// @route   POST /api/attendance/check-in
// @access  Private/Admin/Trainer
exports.checkIn = async (req, res, next) => {
    try {
        let { userId, memberId } = req.body;

        // Resolve user if memberId is provided instead of userId
        if (!userId && memberId) {
            const user = await User.findOne({ 
                $or: [{ memberId: memberId }, { phoneNumber: memberId }] 
            });
            if (!user) {
                res.status(404);
                throw new Error('Member not found with provided ID or Phone');
            }
            userId = user._id;
        }

        if (!userId) {
            res.status(400);
            throw new Error('User ID or Member ID is required');
        }

        // Check if already checked in today and not checked out
        const openSession = await Attendance.findOne({ user: userId, checkOut: null });
        if (openSession) {
            res.status(400);
            throw new Error('User is already checked in');
        }

        const attendance = await Attendance.create({
            user: userId,
            date: new Date().setHours(0, 0, 0, 0), // Today's date without time
            checkIn: new Date(),
            status: 'checked-in'
        });

        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Check-out a user
// @route   POST /api/attendance/check-out
// @access  Private/Admin/Trainer
exports.checkOut = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const openSession = await Attendance.findOne({ user: userId, checkOut: null });
        if (!openSession) {
            res.status(400);
            throw new Error('User is not checked in');
        }

        openSession.checkOut = new Date();
        openSession.status = 'checked-out';
        await openSession.save();

        res.json(openSession);
    } catch (error) {
        next(error);
    }
};

// @desc    Get attendance history for a user
// @route   GET /api/attendance/user/:id
// @access  Private
exports.getUserAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({ user: req.params.id }).sort({ checkIn: -1 });
        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's attendance
// @route   GET /api/attendance/me
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({ user: req.user._id }).sort({ checkIn: -1 });
        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active check-ins
// @route   GET /api/attendance/active
// @access  Private/Admin/Trainer
exports.getActiveCheckIns = async (req, res, next) => {
    try {
        const active = await Attendance.find({ checkOut: null }).populate('user', 'username email profilePhoto');
        res.json(active);
    } catch (error) {
        next(error);
    }
};

// @desc    Get daily stats
// @route   GET /api/attendance/stats
// @access  Private/Admin
exports.getAttendanceStats = async (req, res, next) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const count = await Attendance.countDocuments({ date: today });
        res.json({ todayParams: today, count });
    } catch (error) {
        next(error);
    }
};
