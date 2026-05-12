const asyncHandler = require('express-async-handler');

/**
 * RBAC Middleware — requireRole(...roles)
 * Usage: router.get('/endpoint', protect, requireRole('super_admin', 'gym_owner'), handler)
 *
 * Also provides backward-compatible helpers:
 *   isAdmin  — super_admin, gym_owner
 *   isStaff  — super_admin, gym_owner, receptionist, male_trainer, female_trainer, dietician, accountant
 */

const ROLE_HIERARCHY = {
    super_admin:    10,
    gym_owner:      8,
    admin:          7,
    receptionist:   6,
    male_trainer:   5,
    female_trainer: 5,
    dietician:      4,
    accountant:     4,
    member:         1,
};

// All staff roles (non-member)
const STAFF_ROLES = ['super_admin', 'gym_owner', 'admin', 'receptionist', 'male_trainer', 'female_trainer', 'dietician', 'accountant'];

// All trainer roles
const TRAINER_ROLES = ['male_trainer', 'female_trainer', 'super_admin', 'gym_owner', 'admin'];

// Admin roles
const ADMIN_ROLES = ['super_admin', 'gym_owner', 'admin'];

/**
 * Flexible role-check middleware. Pass one or more allowed roles.
 * @param  {...string} roles - allowed role strings
 */
const requireRole = (...roles) => asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, please login');
    }
    if (roles.includes(req.user.role)) {
        return next();
    }
    res.status(403);
    throw new Error(`Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`);
});

/**
 * Check if user has at least a certain hierarchy level
 */
const requireLevel = (minLevel) => asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    if (userLevel >= minLevel) {
        return next();
    }
    res.status(403);
    throw new Error('Insufficient permissions');
});

// Convenience shorthands
const isAdmin = requireRole(...ADMIN_ROLES);
const isStaff = requireRole(...STAFF_ROLES);
const isTrainer = requireRole(...TRAINER_ROLES);

module.exports = {
    requireRole,
    requireLevel,
    isAdmin,
    isStaff,
    isTrainer,
    STAFF_ROLES,
    ADMIN_ROLES,
    TRAINER_ROLES,
    ROLE_HIERARCHY,
};
