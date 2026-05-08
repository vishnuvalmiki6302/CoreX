const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');

router.route('/')
    .get(getProducts)
    .post(protect, isAdmin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, isAdmin, updateProduct)
    .delete(protect, isAdmin, deleteProduct);

module.exports = router;
