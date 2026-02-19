const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String, // 'checked-in', 'checked-out'
        default: 'checked-in'
    }
}, { timestamps: true });

// Ensure one check-in per user per day? Or multiple?
// Let's allow multiple but usually one.
// We might want an index on user and date?
AttendanceSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
