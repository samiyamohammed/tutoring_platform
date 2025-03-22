const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");

router.post("/send", (req, res) => new NotificationController(req.app.get("io")).sendNotification(req, res));
router.get("/:userId", (req, res) => new NotificationController(req.app.get("io")).getUserNotifications(req, res));
router.post("/markAsRead", (req, res) => new NotificationController(req.app.get("io")).markAsRead(req, res));

module.exports = router;
