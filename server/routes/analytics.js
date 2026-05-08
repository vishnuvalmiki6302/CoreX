const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRevenue,
    getMembershipStats,
    getTrainerPerformance,
    getGenderRatio,
    getRetention,
    getRevenueChart,
    getAttendanceChart,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole, ADMIN_ROLES } = require('../middleware/rbac');

const analyticsAccess = requireRole(...ADMIN_ROLES, 'accountant', 'receptionist');

router.get('/stats', protect, analyticsAccess, getDashboardStats);
router.get('/revenue', protect, requireRole(...ADMIN_ROLES, 'accountant'), getRevenue);
router.get('/membership-stats', protect, analyticsAccess, getMembershipStats);
router.get('/trainer-performance', protect, analyticsAccess, getTrainerPerformance);
router.get('/gender-ratio', protect, analyticsAccess, getGenderRatio);
router.get('/retention', protect, requireRole(...ADMIN_ROLES, 'accountant'), getRetention);
router.get('/revenue-chart', protect, analyticsAccess, getRevenueChart);
router.get('/attendance-chart', protect, analyticsAccess, getAttendanceChart);

module.exports = router;
