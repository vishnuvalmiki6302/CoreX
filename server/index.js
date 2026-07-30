const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
const connectDB = require('./db');

dotenv.config({ override: true });

// Database connection is handled in middleware for Serverless compatibility

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
let io;
// Vercel serverless functions don't support WebSockets well, so we only initialize Socket.io locally or on traditional servers
if (!process.env.VERCEL) {
    io = new Server(server, {
        cors: {
            origin: (origin, cb) => cb(null, true),
            credentials: true,
        },
    });

    // Store io instance on app so controllers can emit events
    app.set('io', io);

    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);
        socket.on('join:room', (userId) => socket.join(userId));
        socket.on('disconnect', () => console.log(`[Socket.io] Client disconnected: ${socket.id}`));
    });
} else {
    // Provide a dummy io object for Vercel so controllers don't crash when calling io.emit
    app.set('io', { emit: () => { }, to: () => ({ emit: () => { } }) });
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Rate limit all API routes !!
app.use('/api/', generalLimiter);

// NOTE: DB connection is done at startup below (not per-request) to prevent "Too many open files" errors

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('CoreX Gym API is running ✅'));

// Auth
app.use('/api/auth', require('./routes/auth'));

// Core
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/products', require('./routes/products'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diets', require('./routes/diets'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/plan-programs', require('./routes/planPrograms'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/content', require('./routes/content'));
app.use('/api/test-db', require('./routes/test-db'));

// New Phase 1–4 Routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/health', require('./routes/health'));
app.use('/api/bulk', require('./routes/bulk'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/leads', require('./routes/leads'));

// ─── SCHEDULER ────────────────────────────────────────────────────────────────
if (!process.env.VERCEL && (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SCHEDULER === 'true')) {
    const runScheduler = require('./utils/scheduler');
    runScheduler();
}

// ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START ────────────────────────────────────────────────────────────────────
if (require.main === module) {
    connectDB()
        .then(() => {
            server.listen(PORT, () => {
                console.log(`🚀 CoreX Server running on port ${PORT}`);
                console.log(`🔌 Socket.io enabled`);
            });
        })
        .catch((err) => {
            console.error('❌ Failed to connect to MongoDB. Server not started.', err.message);
            process.exit(1);
        });
}

module.exports = app;
