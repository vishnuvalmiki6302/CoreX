const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    weight: Number,       // kg
    bmi: Number,
    bodyFat: Number,      // percentage
    chest: Number,        // cm
    waist: Number,        // cm
    hips: Number,         // cm
    arms: Number,         // cm
    thighs: Number,       // cm
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
