import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./infrastructure/database/db.js";
import userRoutes from "./interfaces/routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
