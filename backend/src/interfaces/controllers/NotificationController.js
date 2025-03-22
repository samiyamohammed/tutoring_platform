const NotificationService = require("../../application/services/NotificationService");

class NotificationController {
  constructor(io) {
    this.notificationService = new NotificationService(io);
  }

  async sendNotification(req, res) {
    try {
      const { title, message, recipients = [] } = req.body;
      const notification = await this.notificationService.sendNotification({ title, message, recipients });
      return res.status(201).json({ message: "Notification sent", notification });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await this.notificationService.getUserNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const { userId, notificationId } = req.body;
      await this.notificationService.markAsRead(userId, notificationId);
      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NotificationController;
