import express from "express";
import ChatController from "../controllers/ChatController.js"; 
import { io } from "../../infrastructure/config/socketConfig.js";

const router = express.Router();

// Initialize ChatController with socket instance
const chatController = new ChatController(io);

// Chat Room Routes
router.get("/", chatController.getUserChats.bind(chatController));
router.post("/private/:userId", chatController.createPrivateChat.bind(chatController));
router.post("/group", chatController.createGroupChat.bind(chatController));
router.get("/:roomId", chatController.getChatDetails.bind(chatController));

// Message Routes
router.post("/:roomId/messages", chatController.sendMessage.bind(chatController));
router.get("/:roomId/messages", chatController.getMessages.bind(chatController));
router.post("/:roomId/messages/read", chatController.markMessagesAsRead.bind(chatController));
router.put("/messages/:messageId", chatController.editMessage.bind(chatController));
router.delete("/messages/:messageId", chatController.deleteMessage.bind(chatController));
router.post("/messages/:messageId/reactions", chatController.addReaction.bind(chatController));

export default router;