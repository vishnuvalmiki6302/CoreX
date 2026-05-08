const User = require('../models/User');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Plan = require('../models/Plan');

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [totalMembers, totalTrainers, activeMembers, expiredMembers] = await Promise.all([
            User.countDocuments({ role: 'member' }),
            User.countDocuments({ role: { $in: ['male_trainer', 'female_trainer'] } }),
            User.countDocuments({ role: 'member', status: 'active' }),
            User.countDocuments({ role: 'member', status: 'expired' }),
        ]);

        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const activeCheckIns = await Attendance.countDocuments({ checkIn: { $gte: startOfDay }, checkOut: null });

        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiringCount = await User.countDocuments({
            role: 'member', status: 'active',
            membershipExpiry: { $gte: new Date(), $lte: sevenDaysFromNow }
        });

        res.json({ totalMembers, totalTrainers, activeMembers, expiredMembers, totalRevenue, activeCheckIns, expiringCount });
    } catch (error) { next(error); }
};

// ─── REVENUE (monthly, 12 months) ─────────────────────────────────────────────
exports.getRevenue = async (req, res, next) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthly = await Payment.aggregate([
            { $match: { status: 'completed', date: { $gte: twelveMonthsAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const daily = await Payment.aggregate([
            { $match: { status: 'completed', date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$amount' } } },
            { $sort: { _id: 1 } }
        ]);

        const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
        const currentMonthRevenue = monthly[monthly.length - 1]?.revenue || 0;

        res.json({ monthly, daily, totalRevenue, currentMonthRevenue });
    } catch (error) { next(error); }
};

// ─── MEMBERSHIP STATS ──────────────────────────────────────────────────────────
exports.getMembershipStats = async (req, res, next) => {
    try {
        const [active, expired, pending, inactive] = await Promise.all([
            User.countDocuments({ role: 'member', status: 'active' }),
            User.countDocuments({ role: 'member', status: 'expired' }),
            User.countDocuments({ role: 'member', status: 'pending' }),
            User.countDocuments({ role: 'member', status: 'inactive' }),
        ]);

        const planDistribution = await User.aggregate([
            { $match: { role: 'member' } },
            { $group: { _id: '$membershipType', count: { $sum: 1 } } },
        ]);

        const memberGrowth = await User.aggregate([
            { $match: { role: 'member' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, newMembers: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({ active, expired, pending, inactive, total: active + expired + pending + inactive, planDistribution, memberGrowth });
    } catch (error) { next(error); }
};

// ─── TRAINER PERFORMANCE ───────────────────────────────────────────────────────
exports.getTrainerPerformance = async (req, res, next) => {
    try {
        const trainers = await User.find({ role: { $in: ['male_trainer', 'female_trainer'] } })
            .select('username gender profilePhoto');

        const performance = await Promise.all(trainers.map(async (trainer) => {
            const assignedCount = await User.countDocuments({ assignedTrainer: trainer._id, role: 'member' });
            const activeCount = await User.countDocuments({ assignedTrainer: trainer._id, role: 'member', status: 'active' });
            return {
                _id: trainer._id,
                name: trainer.username,
                gender: trainer.gender,
                profilePhoto: trainer.profilePhoto,
                assignedMembers: assignedCount,
                activeMembers: activeCount,
                retentionRate: assignedCount > 0 ? ((activeCount / assignedCount) * 100).toFixed(1) : 0,
            };
        }));

        res.json({ performance });
    } catch (error) { next(error); }
};

// ─── GENDER RATIO ──────────────────────────────────────────────────────────────
exports.getGenderRatio = async (req, res, next) => {
    try {
        const ratio = await User.aggregate([
            { $match: { role: 'member' } },
            { $group: { _id: '$gender', count: { $sum: 1 } } },
        ]);
        res.json({ ratio });
    } catch (error) { next(error); }
};

// ─── RETENTION RATE ────────────────────────────────────────────────────────────
exports.getRetention = async (req, res, next) => {
    try {
        const total = await User.countDocuments({ role: 'member' });
        const active = await User.countDocuments({ role: 'member', status: 'active' });
        const retentionRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

        const expiringIn7Days = await User.countDocuments({
            role: 'member', status: 'active',
            membershipExpiry: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        });

        res.json({ total, active, retentionRate, expiringIn7Days });
    } catch (error) { next(error); }
};

// ─── REVENUE CHART (7 days) ────────────────────────────────────────────────────
exports.getRevenueChart = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const payments = await Payment.aggregate([
            { $match: { date: { $gte: sevenDaysAgo }, status: 'completed' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$amount' } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(payments);
    } catch (error) { next(error); }
};

// ─── ATTENDANCE CHART ──────────────────────────────────────────────────────────
exports.getAttendanceChart = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const attendance = await Attendance.aggregate([
            { $match: { checkIn: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(attendance);
    } catch (error) { next(error); }
};
