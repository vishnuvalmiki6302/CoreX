const Notification = require('../models/Notification');
const User = require('../models/User');

const runScheduler = () => {
    console.log('Scheduler started...');

    // Run every 24 hours (86400000 ms)
    setInterval(async () => {
        try {
            console.log('Running daily notification check...');

            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            // Find users expiring soon (active status, expiry within 3 days)
            const users = await User.find({
                status: 'active',
                membershipExpiry: {
                    $gt: new Date(),
                    $lt: threeDaysFromNow
                }
            });

            for (const user of users) {
                // Check if we already notified them recently (e.g., today)
                // For simplicity, we just check if they have an unread warning notification
                const exists = await Notification.findOne({
                    user: user._id,
                    type: 'warning',
                    isRead: false,
                    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                });

                if (!exists) {
                    await Notification.create({
                        user: user._id,
                        type: 'warning',
                        message: `Your membership expires on ${new Date(user.membershipExpiry).toLocaleDateString()}. Please renew soon!`
                    });
                    console.log(`Notification sent to ${user.username}`);
                }
            }

        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
};

module.exports = runScheduler;
