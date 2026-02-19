const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const DietPlan = require('./models/DietPlan');
const Plan = require('./models/Plan');

dotenv.config({ path: './.env' }); // Explicit path just in case

const verifyData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('\n--- Checking Users with Plans ---');
        const users = await User.find({
            $or: [
                { membershipType: { $ne: 'none' } },
                { role: 'user' }
            ]
        }).limit(5);

        for (const user of users) {
            console.log(`\nUser: ${user.username} (${user.email})`);
            console.log(`- Role: ${user.role}`);
            console.log(`- MemberID: ${user.memberId}`);
            console.log(`- Membership Type: ${user.membershipType}`);
            console.log(`- Status: ${user.status}`);
            console.log(`- Expiry: ${user.membershipExpiry}`);
            console.log(`- Plan Start: ${user.planStartDate}`);

            const diets = await DietPlan.find({ member: user._id });
            console.log(`- Diet Plans: ${diets.length}`);
            diets.forEach(d => console.log(`  > ${d.name} (${d.status})`));
        }

        console.log('\n--- Checking Plans ---');
        const plans = await Plan.find({});
        plans.forEach(p => console.log(`- ${p.name} (${p.type}, duration: ${p.durationMonths})`));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyData();
