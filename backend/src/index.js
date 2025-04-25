import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
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
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
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
app.use('/api/enrollment', authenticate, enrollmentRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/course", authenticate, courseRoutes);
// app.use("/api/module", authenticate, moduleRoutes);
// app.use("/api/quiz", authenticate, quizRoutes);
app.use('/api/session', sessionRoutes);

app.get('/files/:id', async (req, res) => {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      const downloadStream = gfs.openDownloadStream(fileId);
      
      // Set proper headers based on file type (optional but recommended)
      const file = await gfs.find({ _id: fileId }).toArray();
      if (file.length > 0) {
        res.set('Content-Type', file[0].contentType);
        res.set('Content-Disposition', `inline; filename="${file[0].filename}"`);
      }
      
      downloadStream.pipe(res);
    } catch (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));


