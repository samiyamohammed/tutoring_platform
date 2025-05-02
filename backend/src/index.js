import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; 
import connectDB from "./infrastructure/database/db.js";
import userRoutes from "./interfaces/routes/userRoutes.js";
import authRoutes from "./interfaces/routes/authRoutes.js";
import courseRoutes from "./interfaces/routes/courseRoutes.js";
import chatRoutes from "./interfaces/routes/chatRoutes.js";
import sessionRoutes from './interfaces/routes/sessionRoutes.js';
import enrollmentRoutes from './interfaces/routes/enrollmentRoutes.js';
import videoSessionRoutes from './interfaces/routes/videoSessionRoutes.js'; // NEW
import { authenticate } from "./interfaces/middlewares/authMiddleware.js"; 
import { init as initSocket } from "./infrastructure/config/socketConfig.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app); 

// Initialize Socket.io with video session handlers
const io = initSocket(server);
setupVideoSessionSocket(io); // NEW

app.use("/api/auth", authRoutes);
app.use('/api/enrollment', authenticate, enrollmentRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/course", authenticate, courseRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/video-sessions', authenticate, videoSessionRoutes); // NEW

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));

// NEW: Video session socket handlers
function setupVideoSessionSocket(io) {
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join-video-session', ({ sessionId, isTutor }) => {
      socket.join(sessionId);
      console.log(`User joined video session ${sessionId} as ${isTutor ? 'tutor' : 'student'}`);
    });
    
    socket.on('video-offer', ({ sessionId, offer }) => {
      socket.to(sessionId).emit('video-offer', offer);
    });
    
    socket.on('video-answer', ({ sessionId, answer }) => {
      socket.to(sessionId).emit('video-answer', answer);
      io.to(sessionId).emit('video-session-connected');
    });
    
    socket.on('video-ice-candidate', ({ sessionId, candidate }) => {
      socket.to(sessionId).emit('video-ice-candidate', candidate);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from video session');
    });
  });
}