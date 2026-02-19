const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
    },
    durationMonths: {
        type: Number,
        required: true,
        default: 1
    },
    features: [{
        type: String
    }],
    highlight: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String, // 'starter', 'pro', 'elite', 'custom'
        enum: ['starter', 'pro', 'elite', 'custom'],
        default: 'custom'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
