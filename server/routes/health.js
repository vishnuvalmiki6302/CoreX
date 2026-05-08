const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole, ADMIN_ROLES, TRAINER_ROLES } = require('../middleware/rbac');
const {
    addRecord, getRecords, getLatestRecord, deleteRecord,
    addTransformationPhoto, getTransformationPhotos,
} = require('../controllers/healthController');

router.use(protect);

router.route('/:userId/records')
    .get(getRecords)
    .post(requireRole('member', ...TRAINER_ROLES, ...ADMIN_ROLES), addRecord);

router.get('/:userId/records/latest', getLatestRecord);
router.delete('/records/:id', deleteRecord);

router.route('/:userId/photos')
    .get(getTransformationPhotos)
    .post(addTransformationPhoto);

module.exports = router;
