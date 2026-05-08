const mongoose = require('mongoose');

const TrainerAppointmentSchema = new mongoose.Schema({
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // e.g. "10:00"
        required: true,
    },
    endTime: {
        type: String, // e.g. "11:00"
        required: true,
    },
    type: {
        type: String,
        enum: ['personal_training', 'assessment', 'consultation', 'group'],
        default: 'personal_training',
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled',
    },
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('TrainerAppointment', TrainerAppointmentSchema);
