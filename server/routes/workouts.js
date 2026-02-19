const express = require('express');
const router = express.Router();
const {
    createWorkoutPlan,
    getMyWorkoutPlans,
    getTrainerPlans,
    getWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
} = require('../controllers/workoutController');
const { protect, trainer } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, trainer, createWorkoutPlan);

router.route('/my-plans').get(protect, getMyWorkoutPlans);
router.route('/trainer/created').get(protect, trainer, getTrainerPlans);

router.route('/:id')
    .get(protect, getWorkoutPlan)
    .put(protect, trainer, updateWorkoutPlan)
    .delete(protect, trainer, deleteWorkoutPlan);

module.exports = router;
