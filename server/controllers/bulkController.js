const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.bulkRenewMemberships = asyncHandler(async (req, res) => {
    const { memberIds, planId, durationDays = 30 } = req.body;
    if (!memberIds?.length) { res.status(400); throw new Error('No member IDs provided'); }

    const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    const result = await User.updateMany(
        { _id: { $in: memberIds }, role: 'member' },
        { $set: { status: 'active', membershipExpiry: expiryDate, currentPlan: planId || undefined } }
    );

    res.json({ success: true, renewedCount: result.modifiedCount, newExpiry: expiryDate });
});

exports.exportMembersCSV = asyncHandler(async (req, res) => {
    const members = await User.find({ role: 'member' })
        .select('username email phoneNumber memberId membershipType membershipExpiry status gender createdAt lastVisit')
        .lean();

    const rows = members.map(m => [
        m.memberId || '', m.username, m.email, m.phoneNumber || '',
        m.gender || '', m.membershipType || '', m.status,
        m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString() : '',
        m.lastVisit ? new Date(m.lastVisit).toLocaleDateString() : '',
        m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    ].join(','));

    const header = 'MemberID,Name,Email,Phone,Gender,Plan,Status,ExpiryDate,LastVisit,JoinDate';
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="corex-members.csv"');
    res.send(csv);
});

exports.bulkSendNotification = asyncHandler(async (req, res) => {
    const { memberIds, title, message, type = 'system' } = req.body;
    if (!memberIds?.length || !message) {
        res.status(400); throw new Error('memberIds and message are required');
    }

    const notifications = memberIds.map(userId => ({
        user: userId, title: title || 'Notification from CoreX', message, type, channel: 'in_app',
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, sentCount: notifications.length });
});
