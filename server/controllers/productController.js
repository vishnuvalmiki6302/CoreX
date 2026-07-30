const Product = require('../models/Product');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');
const crypto = require('crypto');
const path = require('path');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        let { name, price, description, category, image, stock } = req.body;

        if (req.file) {
            const imageName = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `products/${imageName}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };
            const command = new PutObjectCommand(params);
            await s3.send(command);
            image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${imageName}`;
        }

        const product = new Product({
            name,
            price,
            description,
            category,
            image,
            stock
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Error in createProduct:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        let { name, price, description, category, image, stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            if (req.file) {
                const imageName = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `products/${imageName}`,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };
                const command = new PutObjectCommand(params);
                await s3.send(command);
                image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${imageName}`;
            }
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.category = category || product.category;
            product.image = image || product.image;
            product.stock = stock || product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
