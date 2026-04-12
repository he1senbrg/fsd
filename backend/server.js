require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

// routes imports
const authRoutes = require('./routes/authRoutes');

// init express
const app = express();
const server = http.createServer(app);

// middleware
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
];
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// health
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'KalaSetu API is running',
        timestamp: new Date().toISOString(),
    });
});

// routes
app.use('/api/auth', authRoutes);

// 404
app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();

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
};

startServer();

module.exports = { app, server };