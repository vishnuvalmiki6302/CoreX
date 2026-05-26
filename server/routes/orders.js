const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentResult,
        totalAmount
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentResult,
            totalAmount,
            status: 'pending'
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    }
}));

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('user', 'username email');
    res.json(orders);
});

// @desc    Get ALL orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
router.get('/all', protect, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'username email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get orders for specific user (admin/receptionist)
// @route   GET /api/orders/user/:id
// @access  Private/Staff
router.get('/user/:id', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
