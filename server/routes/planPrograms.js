const express = require('express');
const router = express.Router();
const { getPlanProgram, getAllPlanPrograms, createOrUpdatePlanProgram, deletePlanProgram } = require('../controllers/planProgramController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');

// User route — fetch program by their plan type
router.get('/:planType', protect, getPlanProgram);

// Admin routes
router.get('/', protect, isAdmin, getAllPlanPrograms);
router.post('/', protect, isAdmin, createOrUpdatePlanProgram);
router.delete('/:planType', protect, isAdmin, deletePlanProgram);

module.exports = router;
