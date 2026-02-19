const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('./models/Exercise');
const Diet = require('./models/Diet');

dotenv.config({ override: true });

const checkData = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const exerciseCount = await Exercise.countDocuments();
        const dietCount = await Diet.countDocuments();

        console.log('Exercise Count:', exerciseCount);
        console.log('Diet Count:', dietCount);

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkData();
