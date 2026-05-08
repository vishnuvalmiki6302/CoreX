const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Notification',
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'membership_expiry', 'payment_due', 'birthday', 'ai_risk', 'trainer_message', 'system'],
        default: 'info'
    },
    channel: {
        type: String,
        enum: ['in_app', 'email', 'whatsapp'],
        default: 'in_app',
    },
    isRead: {
        type: Boolean,
        default: false
    },
    scheduledAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
