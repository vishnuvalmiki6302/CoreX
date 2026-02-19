const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRevenueChart,
    getAttendanceChart
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/revenue-chart', protect, admin, getRevenueChart);
router.get('/attendance-chart', protect, admin, getAttendanceChart);

module.exports = router;
