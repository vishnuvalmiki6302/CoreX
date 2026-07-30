const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, isAdmin, upload.single('image'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, isAdmin, upload.single('image'), updateProduct)
    .delete(protect, isAdmin, deleteProduct);

module.exports = router;
