import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; 
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
app.use(express.json());
app.use(cors());

const server = http.createServer(app); 

initSocket(server);

app.use("/api/auth", authRoutes);
app.use('/api/enrollment', authenticate, enrollmentRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/chat", authenticate, chatRoutes);
app.use("/api/course", authenticate, courseRoutes);
app.use("/api/module", authenticate, moduleRoutes);
// app.use("/api/quiz", authenticate, quizRoutes);
app.use('/api/session', sessionRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));


