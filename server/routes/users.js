const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isStaff, isAdmin } = require('../middleware/rbac');
const {
    getUserProfile,
    updateUserProfile,
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    getTrainers,
    getMyClients
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePhoto'), updateUserProfile);

router.route('/trainers').get(getTrainers);
router.route('/my-clients').get(protect, getMyClients);

router.route('/')
    .get(protect, isStaff, getMembers)
    .post(protect, isStaff, createMember);

router.route('/:id')
    .get(protect, isStaff, getMemberById)
    .put(protect, isStaff, updateMember)
    .delete(protect, isAdmin, deleteMember);

module.exports = router;
