const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    interestedIn: {
        type: String, // e.g. "monthly plan", "PT sessions"
    },
    visitDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'lost'],
        default: 'new',
    },
    notes: String,
    followUpDate: Date,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // receptionist
    },
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
