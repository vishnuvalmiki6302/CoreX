const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');

// @desc    Create a new workout plan
// @route   POST /api/workouts
// @access  Private/Trainer/Admin
exports.createWorkoutPlan = async (req, res, next) => {
    try {
        const { memberId, name, description, startDate, endDate, schedule } = req.body;

        const plan = await WorkoutPlan.create({
            member: memberId,
            trainer: req.user._id,
            name,
            description,
            startDate,
            endDate,
            schedule
        });

        res.status(201).json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all workout plans for a user
// @route   GET /api/workouts/my-plans
// @access  Private
exports.getMyWorkoutPlans = async (req, res, next) => {
    try {
        const plans = await WorkoutPlan.find({ member: req.user._id })
            .populate('trainer', 'username')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get plans created by trainer
// @route   GET /api/workouts/trainer/created
// @access  Private/Trainer
exports.getTrainerPlans = async (req, res, next) => {
    try {
        const plans = await WorkoutPlan.find({ trainer: req.user._id })
            .populate('member', 'username')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single workout plan
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkoutPlan = async (req, res, next) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id)
            .populate('member', 'username')
            .populate('trainer', 'username');

        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }

        // Verify access (owner, trainer, or admin)
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

// @desc    Update workout plan
// @route   PUT /api/workouts/:id
// @access  Private/Trainer/Admin
exports.updateWorkoutPlan = async (req, res, next) => {
    try {
        let plan = await WorkoutPlan.findById(req.params.id);

        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }

        // Verify ownership
        if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized');
        }

        plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete workout plan
// @route   DELETE /api/workouts/:id
// @access  Private/Trainer/Admin
exports.deleteWorkoutPlan = async (req, res, next) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);

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
