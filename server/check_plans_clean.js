const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');

dotenv.config({ override: true });

const checkPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const plans = await Plan.find();
        plans.forEach(p => {
            console.log(`Plan: ${p.name}, Price: ${p.price}, Type: ${p.type}, ID: ${p._id}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPlans();
