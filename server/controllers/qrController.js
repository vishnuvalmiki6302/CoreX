const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { logAudit } = require('../middleware/auditLogger');

exports.generateMemberQR = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (!user.qrToken) {
        user.qrToken = uuidv4();
        await user.save({ validateModifiedOnly: true });
    }
    const qrDataUrl = await QRCode.toDataURL(user.qrToken, { width: 300, margin: 2 });
    res.json({ success: true, memberId: user.memberId, username: user.username, qrToken: user.qrToken, qrDataUrl });
});

exports.regenerateQR = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) { res.status(404); throw new Error('User not found'); }
    user.qrToken = uuidv4();
    await user.save({ validateModifiedOnly: true });
    const qrDataUrl = await QRCode.toDataURL(user.qrToken, { width: 300, margin: 2 });
    await logAudit(req, 'QR_REGENERATED', user._id, 'User');
    res.json({ success: true, qrToken: user.qrToken, qrDataUrl });
});

exports.scanQR = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) { res.status(400); throw new Error('QR token is required'); }

    const user = await User.findOne({ qrToken: token }).select('-password -refreshToken');
    if (!user) { res.status(404); throw new Error('Invalid or expired QR code'); }
    if (user.role !== 'member') { res.status(403); throw new Error('QR check-in is only for members'); }

    if (user.status === 'expired') {
        return res.status(403).json({
            success: false,
            message: 'Membership expired. Please renew at the reception.',
            user: { username: user.username, memberId: user.memberId },
        });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existingRecord = await Attendance.findOne({ user: user._id, checkIn: { $gte: today }, checkOut: null });

    if (existingRecord) {
        existingRecord.checkOut = new Date();
        await existingRecord.save();
        return res.json({ success: true, action: 'checkout', message: `Goodbye ${user.username}! Have a great day! 💪`, user: { username: user.username, memberId: user.memberId, profilePhoto: user.profilePhoto } });
    }

    await Attendance.create({ user: user._id, checkIn: new Date() });
    user.lastVisit = new Date();
    await user.save({ validateModifiedOnly: true });
    await logAudit(req, 'MEMBER_QR_CHECKIN', user._id, 'User', { method: 'QR' });

    res.json({ success: true, action: 'checkin', message: `Welcome back, ${user.username}! 🔥`, user: { username: user.username, memberId: user.memberId, profilePhoto: user.profilePhoto } });
});
