const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private/Admin
exports.createPayment = async (req, res, next) => {
    try {
        const { userId, planId, amount, date, method, status, transactionId, notes } = req.body;

        const payment = await Payment.create({
            user: userId,
            plan: planId,
            amount,
            date: date || Date.now(),
            method,
            status,
            transactionId,
            notes
        });

        // Update user's plan if payment is for a plan and status is completed
        if (planId && status === 'completed') {
            const plan = await require('../models/Plan').findById(planId);
            const user = await User.findById(userId);

            if (plan && user) {
                const startDate = new Date();
                const expiryDate = new Date(startDate);
                expiryDate.setMonth(startDate.getMonth() + (plan.durationMonths || 1));

                user.membershipType = plan.type || 'custom';
                user.currentPlan = plan._id;
                user.planStartDate = startDate;
                user.membershipExpiry = expiryDate;
                user.status = 'active';

                // If user didn't have a memberId, they might get one here or via pre-save hook
                await user.save();
            }
        }

        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'username email')
            .populate('plan', 'name')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get payments for a specific user
// @route   GET /api/payments/user/:id
// @access  Private (Admin or Self)
exports.getUserPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.params.id })
            .populate('plan', 'name')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get my payments
// @route   GET /api/payments/my-history
// @access  Private
exports.getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('plan', 'name')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'username email address phoneNumber')
            .populate('plan', 'name price durationMonths');

        if (!payment) {
            res.status(404);
            throw new Error('Payment not found');
        }

        res.json(payment);
    } catch (error) {
        next(error);
    }
};
