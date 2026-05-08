const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    actorName: String,
    actorRole: String,
    action: {
        type: String,
        required: true,
        // e.g. 'USER_LOGIN', 'PAYMENT_CREATED', 'ROLE_CHANGED', 'MEMBER_CHECKIN'
    },
    target: {
        type: String, // e.g. userId or paymentId being acted on
    },
    targetModel: String,
    ip: String,
    details: {
        type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// TTL index: auto-delete audit logs after 1 year
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 3600 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
