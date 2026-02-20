const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

// @desc    Create a new diet plan
// @route   POST /api/diets
// @access  Private/Trainer/Admin
exports.createDietPlan = async (req, res, next) => {
    try {
        const { memberId, name, description, startDate, endDate, dailyMeals, totalCalories, isCustom } = req.body;

        const plan = await DietPlan.create({
            member: memberId,
            trainer: req.user._id,
            name,
            description,
            startDate,
            endDate,
            dailyMeals,
            totalCalories,
            isCustom
        });

        res.status(201).json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all diet plans
// @route   GET /api/diets
// @access  Public
exports.getAllDietPlans = async (req, res, next) => {
    try {
        const plans = await DietPlan.find().sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all diet plans for a user
// @route   GET /api/diets/my-plans
// @access  Private
exports.getMyDietPlans = async (req, res, next) => {
    try {
        const plans = await DietPlan.find({ member: req.user._id })
            .populate('trainer', 'username')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get plans created by trainer
// @route   GET /api/diets/trainer/created
// @access  Private/Trainer
exports.getTrainerDietPlans = async (req, res, next) => {
    try {
        const plans = await DietPlan.find({ trainer: req.user._id })
            .populate('member', 'username')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single diet plan
// @route   GET /api/diets/:id
// @access  Private
exports.getDietPlan = async (req, res, next) => {
    try {
        const plan = await DietPlan.findById(req.params.id)
            .populate('member', 'username')
            .populate('trainer', 'username');

        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }

        if (plan.member.toString() !== req.user._id.toString() &&
            plan.trainer.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized');
        }

        res.json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Update diet plan
// @route   PUT /api/diets/:id
// @access  Private/Trainer/Admin
exports.updateDietPlan = async (req, res, next) => {
    try {
        let plan = await DietPlan.findById(req.params.id);

        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }

        if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized');
        }

        plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete diet plan
// @route   DELETE /api/diets/:id
// @access  Private/Trainer/Admin
exports.deleteDietPlan = async (req, res, next) => {
    try {
        const plan = await DietPlan.findById(req.params.id);

        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }

        if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized');
        }

        await plan.deleteOne();
        res.json({ message: 'Plan removed' });
    } catch (error) {
        next(error);
    }
};
