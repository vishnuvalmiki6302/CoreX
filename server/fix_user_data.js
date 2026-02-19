const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const DietPlan = require('./models/DietPlan');
const Plan = require('./models/Plan');

dotenv.config({ path: './.env' });

const fixData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({ membershipType: { $ne: 'none' } });

        console.log(`Found ${users.length} users with memberships.`);

        for (const user of users) {
            console.log(`Updating user: ${user.username}`);

            // Set start date to today, expiry to 30 days from now
            const startDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(startDate.getDate() + 30);

            user.planStartDate = startDate;
            user.membershipExpiry = expiryDate;

            // Ensure status is active
            user.status = 'active';

            await user.save();
            console.log(`- Updated Expiry: ${expiryDate}`);

            // Create a sample diet plan if none exists
            const existingDiet = await DietPlan.findOne({ member: user._id });
            if (!existingDiet) {
                // Find a trainer (or use first admin/user if no trainer)
                const trainer = await User.findOne({ role: 'trainer' }) || await User.findOne({ role: 'admin' });

                if (trainer) {
                    await DietPlan.create({
                        member: user._id,
                        trainer: trainer._id,
                        name: `Standard ${user.membershipType} Diet`,
                        description: 'A balanced diet plan for your goals.',
                        startDate: new Date(),
                        endDate: expiryDate,
                        dailyMeals: [
                            {
                                type: 'Breakfast',
                                items: [{ name: 'Oatmeal', portion: '1 cup', calories: 150 }],
                                time: '08:00 AM'
                            },
                            {
                                type: 'Lunch',
                                items: [{ name: 'Chicken Breast', portion: '200g', calories: 300 }],
                                time: '01:00 PM'
                            }
                        ],
                        totalCalories: 2000,
                        isCustom: false
                    });
                    console.log('- Created sample diet plan');
                }
            } else {
                console.log('- Diet plan already exists');
            }
        }

        console.log('Done.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixData();
