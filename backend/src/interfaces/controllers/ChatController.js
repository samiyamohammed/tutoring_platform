import ChatService from "../../application/services/ChatService.js";

class ChatController {
  // Handle sending a message
  async sendMessage(req, res) {
    try {
      const { messageData } = req.body; // Assuming messageData is sent in the body of the request
      const savedMessage = await ChatService.sendMessage(messageData);
      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error while sending message",
      });
    }
  }

  // Get chat history for a room
  async getChatHistory(req, res) {
    try {
      const { roomId } = req.params;
      const messages = await ChatService.getChatHistory(roomId);
      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error while fetching chat history",
      });
    }
  }
}

export default new ChatController();
