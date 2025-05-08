import express from "express";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import  { gfs }  from "./utils/multer-config.js"; // Import gfs from utils
import mongoose from "mongoose";
import connectDB from "./infrastructure/database/db.js";
import userRoutes from "./interfaces/routes/userRoutes.js";
import authRoutes from "./interfaces/routes/authRoutes.js";
import courseRoutes from "./interfaces/routes/courseRoutes.js";
import quizRoutes from "./interfaces/routes/quizRoutes.js";
import questionRoutes from "./interfaces/routes/questionRoutes.js";
import moduleRoutes from "./interfaces/routes/moduleRoutes.js";
import chatRoutes from "./interfaces/routes/chatRoutes.js";
import sessionRoutes from './interfaces/routes/sessionRoutes.js';
import enrollmentRoutes from './interfaces/routes/enrollmentRoutes.js';
import { authenticate } from "./interfaces/middlewares/authMiddleware.js";
import { init as initSocket } from "./infrastructure/config/socketConfig.js"; // Direct import

dotenv.config();
connectDB();


const app = express();
// Increase payload limits (before routes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads')); // Serve static files from the uploads directory

// Update your CORS configuration
const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000', 'https://learning-management-g043.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

const server = http.createServer(app);

initSocket(server);

app.use("/api/auth", authRoutes);
app.use("/api/enrollment", authenticate, enrollmentRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/course", authenticate, courseRoutes);
app.use("/api/session", authenticate, sessionRoutes);

app.get('/api/files/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id); // Convert to ObjectId

    // Convert cursor to array
    const files = await gfs.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Download stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });

  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
});

app.get('/api/videos/stream/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfs.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    
    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunkSize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': file.contentType
      });
      
      const downloadStream = gfs.openDownloadStream(fileId, { start, end });
      downloadStream.pipe(res);
    } else {
      res.set('Content-Length', file.length);
      const downloadStream = gfs.openDownloadStream(fileId);
      downloadStream.pipe(res);
    }

  } catch (err) {
    console.error('Video streaming error:', err);
    res.status(500).json({ error: 'Video streaming failed' });
  }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));
