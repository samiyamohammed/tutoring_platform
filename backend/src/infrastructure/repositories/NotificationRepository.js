import Notification from "../../domain/models/Notification.js";

class NotificationRepository {
  async createNotification(data) {
    return await Notification.create(data);
  }

  async getNotificationsForUser(userId) {
    return await Notification.find({
      $or: [{ recipients: { $size: 0 } }, { recipients: userId }],
    }).sort({ createdAt: -1 });
  }

  async markNotificationAsRead(userId, notificationId) {
    return await Notification.updateOne(
      { _id: notificationId },
      { $addToSet: { isReadBy: userId } }
    );
  }
}

export default new NotificationRepository(); 
