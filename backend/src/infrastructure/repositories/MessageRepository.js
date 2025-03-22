import Message from "../../domain/models/Message.js";

class MessageRepository {
  async saveMessage(messageData) {
    return await Message.create(messageData);
  }

  async getMessagesByRoom(roomId) {
    return await Message.find({ roomId }).sort({ timestamp: 1 });
  }
}

// Use ES Modules export
export default new MessageRepository();
