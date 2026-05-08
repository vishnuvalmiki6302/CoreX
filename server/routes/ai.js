const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole, isAdmin, ADMIN_ROLES } = require('../middleware/rbac');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
    generateFitnessAssessment,
    generateAIDiet,
    chatWithCoach,
    clearChatSession,
    detectAtRiskMembers,
    getPersonalizedRecommendations,
} = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

// Member routes (all roles with membership)
router.post('/fitness-assessment', aiLimiter, generateFitnessAssessment);
router.post('/diet-plan', aiLimiter, requireRole('member', 'dietician', ...ADMIN_ROLES), generateAIDiet);
router.post('/chat', aiLimiter, chatWithCoach);
router.delete('/chat/session', clearChatSession);

// Staff routes
router.get('/risk-detection', requireRole('super_admin', 'gym_owner', 'receptionist'), detectAtRiskMembers);
router.get('/recommendations/:userId', getPersonalizedRecommendations);

module.exports = router;
