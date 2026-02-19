const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan, getAllPlansAdmin } = require('../controllers/planController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.get('/admin', protect, admin, getAllPlansAdmin);
router.post('/', protect, admin, createPlan);
router.route('/:id')
    .put(protect, admin, updatePlan)
    .delete(protect, admin, deletePlan);

module.exports = router;
