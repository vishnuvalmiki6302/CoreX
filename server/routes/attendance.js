const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getUserAttendance, getActiveCheckIns, getAttendanceStats, getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole, isStaff, isTrainer, ADMIN_ROLES } = require('../middleware/rbac');

router.post('/check-in', protect, isStaff, checkIn);
router.post('/check-out', protect, isStaff, checkOut);
router.get('/active', protect, isStaff, getActiveCheckIns);
router.get('/stats', protect, isStaff, getAttendanceStats);
router.get('/me', protect, getMyAttendance);
router.get('/user/:id', protect, isStaff, getUserAttendance);

module.exports = router;
