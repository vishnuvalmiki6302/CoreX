const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole, ADMIN_ROLES } = require('../middleware/rbac');
const { generateMemberQR, regenerateQR, scanQR } = require('../controllers/qrController');

// Public — kiosk scan (validated server-side)
router.post('/scan', scanQR);

// Protected
router.use(protect);
router.get('/generate/:userId', requireRole(...ADMIN_ROLES, 'receptionist', 'member'), generateMemberQR);
router.post('/regenerate/:userId', requireRole(...ADMIN_ROLES, 'receptionist'), regenerateQR);

module.exports = router;
