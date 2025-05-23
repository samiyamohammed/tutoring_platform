import NotificationRepository from "../../infrastructure/repositories/NotificationRepository.js";
import { io } from "../../infrastructure/config/socketConfig.js"; // Use io directly

class NotificationService {
  async sendNotification({ title, message, recipients = [] }) {
    try {
      const notification = await NotificationRepository.createNotification({
        title,
        message,
        recipients,
      });

      if (recipients.length > 0) {
        recipients.forEach((userId) => {
          io.to(`user_${userId}`).emit("newNotification", notification); // Make sure to join with correct room name
        });
      } else {
        io.emit("newNotification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async getUserNotifications(userId) {
    return await NotificationRepository.getNotificationsForUser(userId);
  }

  async markAsRead(userId, notificationId) {
    try {
      await NotificationRepository.markNotificationAsRead(userId, notificationId);
      io.to(`user_${userId}`).emit("notificationRead", { userId, notificationId }); // ✅ Use io directly
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
}

export default new NotificationService();
