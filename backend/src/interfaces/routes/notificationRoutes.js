import express from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = express.Router();

// Middleware to inject `io` into the controller instance
router.use((req, res, next) => {
  req.notificationController = new NotificationController(req.app.get("io"));
  next();
});

// Send a new notification (usually by admin or event)
router.post("/send", (req, res) => {
  req.notificationController.sendNotification(req, res);
});

// Get all notifications for a user
router.get("/:userId", (req, res) => {
  req.notificationController.getUserNotifications(req, res);
});

// Mark a notification as read
router.post("/markAsRead", (req, res) => {
  req.notificationController.markAsRead(req, res);
});

export default router;
