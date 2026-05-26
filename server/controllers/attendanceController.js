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

// @desc    Member self check-in (member marks their own attendance)
// @route   POST /api/attendance/self-check-in
// @access  Private (any authenticated user)
exports.selfCheckIn = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Check if already checked in with no open session
        const openSession = await Attendance.findOne({ user: userId, checkOut: null });
        if (openSession) {
            return res.status(200).json({
                alreadyCheckedIn: true,
                message: 'You are already checked in today!',
                session: openSession
            });
        }

        const attendance = await Attendance.create({
            user: userId,
            date: new Date().setHours(0, 0, 0, 0),
            checkIn: new Date(),
            status: 'checked-in'
        });

        res.status(201).json({
            message: 'Attendance marked successfully! Welcome to CoreX 💪',
            session: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Member self check-out
// @route   POST /api/attendance/self-check-out
// @access  Private (any authenticated user)
exports.selfCheckOut = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const openSession = await Attendance.findOne({ user: userId, checkOut: null });
        if (!openSession) {
            return res.status(400).json({ message: 'You are not currently checked in.' });
        }

        openSession.checkOut = new Date();
        openSession.status = 'checked-out';
        await openSession.save();

        const duration = Math.round((openSession.checkOut - openSession.checkIn) / 60000);
        res.json({
            message: `Great workout! You trained for ${duration} minutes 🔥`,
            session: openSession
        });
    } catch (error) {
        next(error);
    }
};
