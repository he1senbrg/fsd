require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const connectDB = require('./config/db');
const { setupSocketIO } = require('./config/socketio');
const globalErrorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');
const NotificationService = require('./services/NotificationService');
const { startCampaignScheduler } = require('./services/CampaignScheduler');

// routes imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const eventRoutes = require('./routes/eventRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const orderRoutes = require('./routes/orderRoutes');
const artistRoutes = require('./routes/artistRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const helpRoutes = require('./routes/helpRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const artFormRoutes = require('./routes/artFormRoutes');

// init express
const app = express();
const server = http.createServer(app);
let dbConnected = false;

// socket.io
const io = setupSocketIO(server);
NotificationService.setIO(io);

// middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
];
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// health
app.get('/api/health', (req, res) => {
  const statusCode = dbConnected ? 200 : 503;

  res.status(statusCode).json({
    status: dbConnected ? 'success' : 'degraded',
    message: dbConnected
      ? 'KalaSetu API is running'
      : 'KalaSetu API is running but database is unavailable',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sponsor-tiers', sponsorRoutes);
app.use('/api/art-forms', artFormRoutes);

// 404
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   KalaSetu API Server                    ║
║   Running on port ${PORT}                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   API: http://localhost:${PORT}/api         ║
╚══════════════════════════════════════════╝
    `);
  });

  try {
    await connectDB();
    dbConnected = true;
    startCampaignScheduler();
  } catch (err) {
    console.error(`Database startup error: ${err.message}`);
    console.error('Server is running in degraded mode until database connectivity is restored.');
  }
};

startServer();

module.exports = { app, server };
