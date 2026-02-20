const mongoose = require('mongoose');
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'gym-genix' // Explicitly specifying dbName is good practice
        });

        isConnected = conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('CRITICAL: MongoDB connection failed');
        // Don't exit process in serverless env, just throw
        throw error;
    }
};

module.exports = connectDB;
