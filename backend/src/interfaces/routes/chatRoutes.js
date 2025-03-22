import express from "express";
import ChatController from "../controllers/ChatController.js"; // Adjust the path if necessary

const router = express.Router();

// Route to send a message
router.post("/send", ChatController.sendMessage);

// Route to get chat history by room ID
router.get("/history/:roomId", ChatController.getChatHistory);

export default router;
