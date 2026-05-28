import 'dotenv/config'

import jwt from 'jsonwebtoken'
import connectDB from './config/db.js';

import express from 'express';
import cors from 'cors';

// For Socket
import { createServer } from 'node:http'
import { Server } from 'socket.io'

// import routes
import authRoutes from './routes/authRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import availabilityRoutes from './routes/availabilityRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import withdrawalRoutes from './routes/withdrawalRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import videoRoutes from './routes/videoRoutes.js'
import devRoutes from './routes/devRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
// import testRoutes from './routes/testRoutes.js'

import errorHandler from './middleware/errorMiddleware.js';

connectDB();

const app = express();

// Create HTTP server from Express app
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

// WebRTC  Signaling
io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if(!token) {
        return next(new Error('Authentication error'))
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.user = decoded
        next()

    } catch {
        return next(new Error('Invalid token'))
    }
})

io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id, '| User:', socket.user?.sub)

    // peer joins a room using roomId
    socket.on('join-room', (roomId) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        
        // notify the other peer that someone joined
        socket.to(roomId).emit('peer-joined', socket.id)
    })

    // caller sends offer SDP to the other peer
    socket.on('offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('offer', { offer, from: socket.id})
    })

    // callee sends answer SDP back to caller
    socket.on('answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('answer', { answer, from: socket.id})
    })

    // both peers exchange ICE candidates
    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', {
            candidate,
            from: socket.id
        })
    })

    // peer leaves the room
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId)
        socket.to(roomId).emit('peer-left')
        console.log(`Socket ${socket.id} left room ${roomId}`)
    })

    socket.on('disconnect', () => {
        console.log('Socket disconnected: ', socket.id)
    })
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Webhook route MUST be registered before express.json() as it needs raw body
app.use('/api/webhook', webhookRoutes)

app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running'});
});


// api routes
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/availability',availabilityRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/video', videoRoutes)
app.use('/api/payments', paymentRoutes)

// dev only
if(process.env.NODE_ENV !== 'production') {
    app.use('/api/dev', devRoutes)
}

// app.use('/api/test', testRoutes)


// global error handler (must be last)
app.use(errorHandler);


// Start server
// using httpServer instead of app.listen so Socket.io works on same port
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
