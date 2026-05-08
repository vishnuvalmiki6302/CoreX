const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan, getAllPlansAdmin } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');

router.get('/', getPlans);
router.get('/admin', protect, isAdmin, getAllPlansAdmin);
router.post('/', protect, isAdmin, createPlan);
router.route('/:id')
    .put(protect, isAdmin, updatePlan)
    .delete(protect, isAdmin, deletePlan);

module.exports = router;
