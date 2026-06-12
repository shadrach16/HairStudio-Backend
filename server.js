// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');

// Import middleware
const requestLogger = require('./middleware/requestLogger'); // 👈 ADD THIS LINE
const errorHandler = require('./middleware/errorHandler'); // 👈 ADD THIS LINE

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hairstyleRoutes = require('./routes/hairstyles');
const generationRoutes = require('./routes/generations');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhook');
const watermarkRoutes = require('./routes/watermark');
const paymentRoutes = require('./routes/payments');
const favoriteRoutes = require('./routes/favorites');
const streakRoutes = require('./routes/streaks');
const pushRoutes = require('./routes/push');
const savedLooksRoutes = require('./routes/savedLooks');
const collectionRoutes = require('./routes/collections');
const p2cRoutes = require('./routes/p2c'); // Photo2Calendar proxy (isolated)


const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost',
      'https://apiv2.campusprint.com.ng',
      'https://app.revenuecat.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked CORS for origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use('/api/webhooks', webhookRoutes);

// Body parsing middleware
const jsonMiddleware = express.json({ limit: '20mb' });

// Use the custom request logger
app.use(requestLogger); // 👈 ADD THIS LINE
app.use(errorHandler); // 👈 ADD THIS LINE

app.use('/renders', express.static(path.join(__dirname, 'public/renders')));


app.use((req, res, next) => {
    // Check if the request is a file upload (POST to the /generations prefix)
    const isFileUploadRoute = 
        req.method === 'POST' && 
        req.originalUrl.startsWith('/api/generations');

    if (isFileUploadRoute) {
        // Skip global JSON parsing. Multer will handle the body on the router level.
        return next();
    }

    // For all other routes, run the JSON parser.
    return jsonMiddleware(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Afro AI API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hairstyles', hairstyleRoutes);
app.use('/api/generations', generationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/watermark', watermarkRoutes);
app.use('/api/saved-looks', savedLooksRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/p2c', p2cRoutes); // Photo2Calendar proxy (isolated)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to African Hair Studio API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/google',
      'GET /api/auth/me',
      'GET /api/hairstyles',
      'POST /api/generations/generate',
      'GET /api/generations/history',
      'POST /api/analytics/track',
      'GET /api/analytics/dashboard',
      'GET /api/payments/plans',
      'GET /api/payments/history',
      'POST /api/payments/initialize'
    ]
  });
});

 

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  
  // Start scheduled cleanup jobs after DB connection
  const { startScheduledCleanup } = require('./utils/cleanup');
  startScheduledCleanup();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API base: http://localhost:${PORT}/api`);
});

 

module.exports = app;