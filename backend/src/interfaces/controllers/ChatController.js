import ChatService from "../../application/services/ChatService.js"; // Use import instead of require

class ChatController {
  constructor(io) {
    this.chatService = new ChatService(io);
  }

  // Chat Room Endpoints
  async createPrivateChat(req, res) {
    try {
      const { userId } = req.params;
      const chat = await this.chatService.createPrivateChat(req.user._id, userId);
      res.status(201).json(chat);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createGroupChat(req, res) {
    try {
      const { participantIds, name, avatar } = req.body;
      const chat = await this.chatService.createGroupChat(
        req.user._id,
        participantIds,
        name,
        avatar
      );
      res.status(201).json(chat);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getUserChats(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const chats = await this.chatService.getChatRoomsForUser(
        req.user._id,
        parseInt(page),
        parseInt(limit)
      );
      res.json(chats);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getChatDetails(req, res) {
    try {
      const { roomId } = req.params;
      const chat = await this.chatService.getChatRoomDetails(roomId, req.user._id);
      res.json(chat);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Message Endpoints
  async sendMessage(req, res) {
    try {
      const { roomId } = req.params;
      const { content, attachments, replyTo } = req.body;
      
      const message = await this.chatService.sendMessage(
        roomId,
        req.user._id,
        content,
        attachments,
        replyTo
      );
      
      res.status(201).json(message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const messages = await this.chatService.getMessages(
        roomId,
        req.user._id,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json(messages);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markMessagesAsRead(req, res) {
    try {
      const { roomId } = req.params;
      const { messageIds } = req.body;
      
      await this.chatService.markMessagesAsRead(
        roomId,
        req.user._id,
        messageIds
      );
      
      res.json({ success: true });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      
      const message = await this.chatService.editMessage(
        messageId,
        req.user._id,
        content
      );
      
      res.json(message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await this.chatService.deleteMessage(messageId, req.user._id);
      res.json(message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async addReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      
      const message = await this.chatService.addReaction(
        messageId,
        req.user._id,
        emoji
      );
      
      res.json(message);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    res.status(status).json({ error: message });
  }
}

export default ChatController;
