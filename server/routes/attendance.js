const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getUserAttendance, getActiveCheckIns, getAttendanceStats, getMyAttendance } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/active', protect, getActiveCheckIns);
router.get('/stats', protect, admin, getAttendanceStats);
router.get('/me', protect, getMyAttendance);
router.get('/user/:id', protect, getUserAttendance);

module.exports = router;
