const mongoose = require('mongoose');

const ExerciseEntrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true }, // e.g. "10-12"
    rest: { type: String, default: '60s' },
    notes: { type: String }
}, { _id: false });

const MealItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    portion: { type: String },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fats: { type: Number }
}, { _id: false });

const MealSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Breakfast, Lunch, Dinner, Pre-Workout, Post-Workout
    time: { type: String },
    items: [MealItemSchema],
    notes: { type: String }
}, { _id: false });

const DayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },
    focus: { type: String }, // e.g. "Chest & Triceps", "Rest & Recovery"
    isRestDay: { type: Boolean, default: false },
    exercises: [ExerciseEntrySchema],
    meals: [MealSchema],
    totalCalories: { type: Number }
}, { _id: false });

const PlanProgramSchema = new mongoose.Schema({
    planType: {
        type: String,
        enum: ['starter', 'pro', 'elite', 'custom'],
        required: true,
        unique: true
    },
    weeklySchedule: [DayScheduleSchema]
}, { timestamps: true });

module.exports = mongoose.model('PlanProgram', PlanProgramSchema);
