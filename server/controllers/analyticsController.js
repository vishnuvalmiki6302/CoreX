const User = require('../models/User');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Plan = require('../models/Plan');

// @desc    Get dashboard stats
// @route   GET /api/analytics/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'user' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });

        // Calculate total revenue
        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Active check-ins today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const activeCheckIns = await Attendance.countDocuments({
            checkIn: { $gte: startOfDay },
            checkOut: null
        });

        res.json({
            totalMembers,
            totalTrainers,
            totalRevenue,
            activeCheckIns
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue chart data (last 7 days)
// @route   GET /api/analytics/revenue-chart
// @access  Private/Admin
exports.getRevenueChart = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const payments = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: sevenDaysAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(payments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get attendance chart data (last 7 days)
// @route   GET /api/analytics/attendance-chart
// @access  Private/Admin
exports.getAttendanceChart = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const attendance = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};
