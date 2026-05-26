const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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
        enum: ['super_admin', 'gym_owner', 'admin', 'receptionist', 'male_trainer', 'female_trainer', 'dietician', 'accountant', 'member', 'trainer'],
        default: 'member'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
        type: Date,
    },
    preferredTrainerGender: {
        type: String,
        enum: ['male', 'female', 'no_preference'],
        default: 'no_preference',
    },
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
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
        sparse: true,
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
        type: String,
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
        bodyFat: Number,
        bmi: Number,
        goals: [String],
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    transformationPhotos: [{
        url: String,
        caption: String,
        isPrivate: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }],
    // QR & Attendance
    qrToken: {
        type: String,
        unique: true,
        sparse: true,
    },
    lastVisit: {
        type: Date,
    },
    // Auth Security
    refreshToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to generate memberId and qrToken
UserSchema.pre('save', async function (next) {
    if (this.role === 'member' && !this.memberId) {
        const dateStr = Date.now().toString().slice(-6);
        const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.memberId = `MEM${dateStr}${randomStr}`;
    }
    if (this.role === 'member' && !this.qrToken) {
        this.qrToken = uuidv4();
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
