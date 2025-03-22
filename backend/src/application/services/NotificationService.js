import NotificationRepository from "../../infrastructure/repositories/NotificationRepository.js";
import { getIO } from "../../infrastructure/config/socketConfig.js";

class NotificationService {
  async sendNotification({ title, message, recipients = [] }) {
    try {
      const notification = await NotificationRepository.createNotification({
        title,
        message,
        recipients,
      });

      const io = getIO();

      if (recipients.length > 0) {
        recipients.forEach((userId) => {
          io.to(userId).emit("newNotification", notification);
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
      const io = getIO();
      io.to(userId).emit("notificationRead", { userId, notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
}

export default new NotificationService(); 
