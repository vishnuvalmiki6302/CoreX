const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole, ADMIN_ROLES } = require('../middleware/rbac');
const { getLeads, createLead, updateLead, deleteLead, getLeadStats } = require('../controllers/leadController');

router.use(protect);
router.use(requireRole(...ADMIN_ROLES, 'receptionist'));

router.get('/stats', getLeadStats);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').put(updateLead).delete(deleteLead);

module.exports = router;
