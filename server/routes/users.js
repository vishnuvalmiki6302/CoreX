const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
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
    .get(protect, admin, getMembers)
    .post(protect, admin, createMember);

router.route('/:id')
    .get(protect, admin, getMemberById)
    .put(protect, admin, updateMember)
    .delete(protect, admin, deleteMember);

module.exports = router;
