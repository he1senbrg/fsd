const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const setupSocketIO = (server) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
    ];
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
                callback(new Error(`CORS: origin ${origin} not allowed`));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // auth middleware for socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.user.fullName} (${socket.user._id})`);

        // join personal room for notifications
        socket.join(`user:${socket.user._id}`);

        // broadcast online status
        socket.broadcast.emit('user:online', { userId: socket.user._id });

        // join conversation room
        socket.on('join:conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        // leave conversation room
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // typing indicators
        socket.on('typing:start', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                userId: socket.user._id,
                fullName: socket.user.fullName,
            });
        });

        socket.on('typing:stop', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                userId: socket.user._id,
            });
        });

        // disconnect
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.user.fullName}`);
            socket.broadcast.emit('user:offline', { userId: socket.user._id });
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

module.exports = { setupSocketIO, getIO };