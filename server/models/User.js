const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'trainer'],
        default: 'user'
    },
    membershipType: {
        type: String,
        default: 'none'
    },
    membershipExpiry: {
        type: Date,
    },
    // Member Management Fields
    memberId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined for admins/trainers who might not have one initially
    },
    phoneNumber: {
        type: String,
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    medicalNotes: {
        type: String, // Allergies, injuries, etc.
    },
    address: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'pending', 'inactive'],
        default: 'active'
    },
    // Relations
    assignedTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    currentPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    planStartDate: {
        type: Date
    },
    profile: {
        age: Number,
        weight: Number,
        height: Number,
        goals: [String],
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to generate memberId if not present
UserSchema.pre('save', async function (next) {
    if (this.role === 'user' && !this.memberId) {
        // Simple ID generation logic: MEM + Timestamp + Random
        const dateStr = Date.now().toString().slice(-6);
        const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.memberId = `MEM${dateStr}${randomStr}`;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
