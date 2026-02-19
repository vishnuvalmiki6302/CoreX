const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all plans (Admin - includes inactive)
// @route   GET /api/plans/admin
// @access  Private/Admin
exports.getAllPlansAdmin = async (req, res, next) => {
    try {
        const plans = await Plan.find({}).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/Admin
exports.createPlan = async (req, res, next) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!plan) {
            res.status(404);
            throw new Error('Plan not found');
        }
        res.json(plan);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (plan) {
            await plan.deleteOne();
            res.json({ message: 'Plan removed' });
        } else {
            res.status(404);
            throw new Error('Plan not found');
        }
    } catch (error) {
        next(error);
    }
};
