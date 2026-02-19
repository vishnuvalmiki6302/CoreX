const mongoose = require('mongoose');

const DietSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    goal: {
        type: String, // e.g., 'Muscle Gain', 'Weight Loss'
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    macros: {
        protein: { type: String, required: true },
        carbs: { type: String, required: true },
        fats: { type: String, required: true },
    },
    meals: {
        breakfast: [String],
        lunch: [String],
        dinner: [String],
        snacks: [String],
    },
});

module.exports = mongoose.model('Diet', DietSchema);
