const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('CRITICAL: MongoDB is not connected. Please ensure mongod is running!');
    }
};

module.exports = connectDB;
