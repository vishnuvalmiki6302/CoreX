const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
    },
    specializations: {
        type: [String],
        default: [],
    },
    imageUrl: {
        type: String,
        required: true,
    },
    socials: {
        instagram: String,
        twitter: String,
        linkedin: String,
    },
    availabilitySchedule: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        startTime: String,
        endTime: String,
    }],
    maxMembers: {
        type: Number,
        default: 30,
    },
    activeMembers: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    // Reference to User account (for login)
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Trainer', TrainerSchema);
