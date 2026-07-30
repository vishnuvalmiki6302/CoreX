const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ListBucketsCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');

router.get('/', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        const isConnected = state === 1;

        // Test S3 connection
        let s3Status = 'unknown';
        let s3Error = null;
        try {
            await s3.send(new ListBucketsCommand({}));
            s3Status = 'connected';
        } catch (err) {
            s3Status = 'error';
            s3Error = err.message;
        }

        res.json({
            status: isConnected ? 'success' : 'error',
            message: `Database is ${states[state]}`,
            readyState: state,
            host: mongoose.connection.host || 'none',
            env_check: {
                hasMongoUri: !!process.env.MONGO_URI,
                uriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
                hasAwsRegion: !!process.env.AWS_REGION,
                awsRegion: process.env.AWS_REGION || 'NOT SET',
                hasAwsBucket: !!process.env.AWS_BUCKET_NAME,
                awsBucket: process.env.AWS_BUCKET_NAME || 'NOT SET',
                hasAwsKeyId: !!process.env.AWS_ACCESS_KEY_ID,
                awsKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 6) + '...' : 'NOT SET',
                hasAwsSecret: !!process.env.AWS_SECRET_ACCESS_KEY,
            },
            s3: {
                status: s3Status,
                error: s3Error,
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Check failed',
            error: error.message
        });
    }
});

module.exports = router;
