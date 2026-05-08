const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendMembershipExpiryEmail, sendBirthdayEmail } = require('./emailService');

const runScheduler = () => {
    console.log('⏰ CoreX Scheduler started');

    // ── Daily 8am: check memberships expiring in 7 days ──────────────────────
    cron.schedule('0 8 * * *', async () => {
        console.log('[Scheduler] Checking expiring memberships...');
        try {
            const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const expiringUsers = await User.find({
                role: 'member',
                status: 'active',
                membershipExpiry: { $gt: new Date(), $lte: sevenDaysFromNow },
            });

            for (const user of expiringUsers) {
                const daysLeft = Math.ceil((user.membershipExpiry - Date.now()) / (24 * 60 * 60 * 1000));

                // Avoid duplicate notifications
                const alreadyNotified = await Notification.findOne({
                    user: user._id,
                    type: 'membership_expiry',
                    isRead: false,
                    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                });

                if (!alreadyNotified) {
                    await Notification.create({
                        user: user._id,
                        title: 'Membership Expiring Soon',
                        type: 'membership_expiry',
                        channel: 'in_app',
                        message: `Your membership expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${new Date(user.membershipExpiry).toLocaleDateString()}. Renew now!`,
                    });
                    // Send email if configured
                    await sendMembershipExpiryEmail(user, daysLeft);
                    console.log(`[Scheduler] Notified ${user.username} — expires in ${daysLeft} day(s)`);
                }
            }
        } catch (err) {
            console.error('[Scheduler] Expiry check error:', err.message);
        }
    });

    // ── Daily 9am: birthday wishes ────────────────────────────────────────────
    cron.schedule('0 9 * * *', async () => {
        console.log('[Scheduler] Checking birthdays...');
        try {
            const today = new Date();
            const members = await User.find({
                role: 'member',
                dateOfBirth: { $exists: true, $ne: null },
            });

            for (const member of members) {
                const dob = new Date(member.dateOfBirth);
                if (dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()) {
                    await Notification.create({
                        user: member._id,
                        title: '🎂 Happy Birthday!',
                        type: 'birthday',
                        channel: 'in_app',
                        message: `Happy Birthday, ${member.username}! 🎉 Wishing you a fantastic day from the CoreX team!`,
                    });
                    await sendBirthdayEmail(member);
                    console.log(`[Scheduler] Birthday wish sent to ${member.username}`);
                }
            }
        } catch (err) {
            console.error('[Scheduler] Birthday check error:', err.message);
        }
    });

    // ── Weekly Monday 7am: flag inactive members ──────────────────────────────
    cron.schedule('0 7 * * 1', async () => {
        console.log('[Scheduler] Checking inactive members...');
        try {
            const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
            const inactiveMembers = await User.find({
                role: 'member',
                status: 'active',
                membershipExpiry: { $gte: new Date() },
                $or: [
                    { lastVisit: { $lt: tenDaysAgo } },
                    { lastVisit: { $exists: false } },
                ],
            });

            // Notify admins
            const admins = await User.find({ role: { $in: ['super_admin', 'gym_owner', 'receptionist'] } });
            if (inactiveMembers.length > 0) {
                for (const admin of admins) {
                    await Notification.create({
                        user: admin._id,
                        title: `⚠️ ${inactiveMembers.length} Members at Risk`,
                        type: 'ai_risk',
                        channel: 'in_app',
                        message: `${inactiveMembers.length} active members haven't visited in 10+ days. Check the At-Risk dashboard.`,
                    });
                }
                console.log(`[Scheduler] Flagged ${inactiveMembers.length} inactive members`);
            }
        } catch (err) {
            console.error('[Scheduler] Inactive check error:', err.message);
        }
    });
};

module.exports = runScheduler;
