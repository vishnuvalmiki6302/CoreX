const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        // Try strict connection check
        const isConnected = state === 1;

        res.json({
            status: isConnected ? 'success' : 'error',
            message: `Database is ${states[state]}`,
            readyState: state,
            host: mongoose.connection.host || 'none',
            env_check: {
                hasMongoUri: !!process.env.MONGO_URI,
                uriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database check failed',
            error: error.message
        });
    }
});

module.exports = router;
