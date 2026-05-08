const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getUserPayments, getMyPayments, getPaymentById } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');

router.route('/')
    .get(protect, isAdmin, getPayments)
    .post(protect, createPayment);

router.route('/my-history').get(protect, getMyPayments);
router.route('/user/:id').get(protect, getUserPayments);
router.route('/:id').get(protect, getPaymentById);

module.exports = router;
