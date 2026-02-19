const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming trainers are users with role 'trainer'
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    durationMinutes: {
        type: Number,
        required: true,
        default: 60
    },
    capacity: {
        type: Number,
        required: true,
        default: 20
    },
    enrolledUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Class', ClassSchema);
