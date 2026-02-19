const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    dailyMeals: [{
        type: {
            type: String, // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'
            required: true
        },
        items: [{
            name: { type: String, required: true },
            portion: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number
        }],
        time: String,
        notes: String
    }],
    totalCalories: Number,
    isCustom: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', DietPlanSchema);
