const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');

dotenv.config({ override: true });

const checkPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const plans = await Plan.find();
        console.log('Current Plans in DB:');
        console.log(JSON.stringify(plans, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPlans();
