const asyncHandler = require('express-async-handler');
const HealthRecord = require('../models/HealthRecord');
const TransformationPhoto = require('../models/TransformationPhoto');

exports.addRecord = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const record = await HealthRecord.create({ user: userId, ...req.body });
    res.status(201).json({ success: true, record });
});

exports.getRecords = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const records = await HealthRecord.find({ user: userId }).sort({ date: 1 });
    res.json({ success: true, records });
});

exports.getLatestRecord = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const record = await HealthRecord.findOne({ user: userId }).sort({ date: -1 });
    res.json({ success: true, record });
});

exports.deleteRecord = asyncHandler(async (req, res) => {
    const record = await HealthRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) { res.status(404); throw new Error('Record not found'); }
    res.json({ success: true, message: 'Record deleted' });
});

exports.addTransformationPhoto = asyncHandler(async (req, res) => {
    const photo = await TransformationPhoto.create({
        user: req.user._id,
        photoUrl: req.body.photoUrl || (req.file ? `/uploads/${req.file.filename}` : null),
        caption: req.body.caption,
        isPrivate: req.body.isPrivate || false,
    });
    res.status(201).json({ success: true, photo });
});

exports.getTransformationPhotos = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const canViewPrivate = String(req.user._id) === String(userId) ||
        ['super_admin', 'gym_owner'].includes(req.user.role);
    const filter = { user: userId };
    if (!canViewPrivate) filter.isPrivate = false;
    const photos = await TransformationPhoto.find(filter).sort({ date: -1 });
    res.json({ success: true, photos });
});
