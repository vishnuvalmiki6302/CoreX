const express = require('express');
const router = express.Router();
const {
    createDietPlan,
    getAllDietPlans,
    getMyDietPlans,
    getTrainerDietPlans,
    getDietPlan,
    updateDietPlan,
    deleteDietPlan
} = require('../controllers/dietController');
const { protect, trainer } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllDietPlans)
    .post(protect, trainer, createDietPlan);

router.route('/my-plans').get(protect, getMyDietPlans);
router.route('/trainer/created').get(protect, trainer, getTrainerDietPlans);

router.route('/:id')
    .get(protect, getDietPlan)
    .put(protect, trainer, updateDietPlan)
    .delete(protect, trainer, deleteDietPlan);

module.exports = router;
