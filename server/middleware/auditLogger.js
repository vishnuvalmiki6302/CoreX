const AuditLog = require('../models/AuditLog');

/**
 * Logs sensitive actions to the AuditLog collection.
 * Usage: await logAudit(req, 'PAYMENT_CREATED', payment._id, 'Payment', { amount });
 */
const logAudit = async (req, action, target = null, targetModel = null, details = {}) => {
    try {
        await AuditLog.create({
            actor: req.user?._id || null,
            actorName: req.user?.username || 'system',
            actorRole: req.user?.role || 'system',
            action,
            target: target?.toString() || null,
            targetModel,
            ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            details,
        });
    } catch (err) {
        // Never crash the main flow if audit logging fails
        console.error('[AuditLogger] Failed to log:', err.message);
    }
};

/**
 * Express middleware factory — use on routes to auto-log after response.
 * Usage: router.post('/login', auditAction('USER_LOGIN'), loginHandler)
 */
const auditAction = (action, extractTarget = null) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            // Fire-and-forget after response
            setImmediate(() => {
                const target = extractTarget ? extractTarget(req, data) : null;
                logAudit(req, action, target, null, { body: sanitizeBody(req.body) });
            });
            return originalJson(data);
        };
        next();
    };
};

// Remove sensitive fields before logging
const sanitizeBody = (body = {}) => {
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.refreshToken;
    delete sanitized.token;
    return sanitized;
};

module.exports = { logAudit, auditAction };
