const express = require('express');
const router = express.Router();
const { getPlanProgram, getAllPlanPrograms, createOrUpdatePlanProgram, deletePlanProgram } = require('../controllers/planProgramController');
const { protect, admin } = require('../middleware/authMiddleware');

// User route — fetch program by their plan type
router.get('/:planType', protect, getPlanProgram);

// Admin routes
router.get('/', protect, admin, getAllPlanPrograms);
router.post('/', protect, admin, createOrUpdatePlanProgram);
router.delete('/:planType', protect, admin, deletePlanProgram);

module.exports = router;
