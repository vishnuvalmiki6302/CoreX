const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const dietRoutes = require('./routes/diets');



dotenv.config({ override: true });

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://gym-genix.vercel.app', // Update this with your actual Vercel project domain
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins dynamically (Useful for dynamic AWS IPs or custom domains)
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Gym Genix API is running');
});

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/products', require('./routes/products'));
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/diets', require('./routes/diets'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/content', require('./routes/content'));
app.use('/api/test-db', require('./routes/test-db'));

// Start Scheduler only in local dev or dedicated worker
// Vercel serverless functions cannot support long-running processes
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SCHEDULER === 'true') {
  const runScheduler = require('./utils/scheduler');
  runScheduler();
}

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
