import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import aiRoutes from './routes/aiRoutes.js';
import loungeRoutes from './routes/loungeRouter.js';
import authRoutes from './routes/authRouter.js';
import { setupSoundclashHandlers } from './sockets/soundClashSocket.js';

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/lounges', loungeRoutes);
app.use('/api/v1/lounges', aiRoutes);

// Basic test route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AI DJ Studio API is running' });
});

// Socket.io connection listener
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_lounge', (loungeId) => {
    socket.join(loungeId);
    console.log(`Socket ${socket.id} joined lounge: ${loungeId}`);
  });

  // Register Soundclash event listeners for this socket
  setupSoundclashHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});