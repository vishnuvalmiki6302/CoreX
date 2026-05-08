const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole, ADMIN_ROLES } = require('../middleware/rbac');
const { bulkRenewMemberships, exportMembersCSV, bulkSendNotification } = require('../controllers/bulkController');

router.use(protect);
router.post('/renew', requireRole(...ADMIN_ROLES, 'receptionist'), bulkRenewMemberships);
router.get('/export-csv', requireRole(...ADMIN_ROLES, 'accountant'), exportMembersCSV);
router.post('/notify', requireRole(...ADMIN_ROLES, 'receptionist'), bulkSendNotification);

module.exports = router;
