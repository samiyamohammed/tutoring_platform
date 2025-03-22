import MessageRepository from "../../infrastructure/repositories/MessageRepository.js";

class ChatService {
    async sendMessage(io, messageData) {
        console.log("Message Data:", messageData); // Log the messageData to debug
        if (!messageData.roomId) {
            throw new Error("Room ID is required.");
        }
        
        const savedMessage = await MessageRepository.saveMessage(messageData);
        // Emit to all users in the room
        io.to(messageData.roomId).emit("receiveMessage", savedMessage);
    }

    async getChatHistory(roomId) {
        return await MessageRepository.getMessagesByRoom(roomId);
    }
}

// Export using ES Modules
export default new ChatService();
