const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Supplements', 'Gear', 'Apparel', 'Equipment', 'Other']
    },
    image: {
        type: String,
        required: false,
        default: 'https://placehold.co/400x400/1a1a2e/ffffff?text=No+Image'
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
