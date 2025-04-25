import { Server } from "socket.io";
import ChatService from "../../application/services/ChatService.js";
import NotificationService from "../../application/services/NotificationService.js";
import CryptoJS from "crypto-js"; // Use the crypto-js library

// Define a secret key for encryption
const secretKey = "yourSecretKeyHere"; // You should use a more secure and dynamic key management system for production

class SocketConfig {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle User Joining
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId); // User joins chat room
        console.log(`User ${socket.id} joined room: ${roomId}`);
      });

      socket.on("joinUser", (userId) => {
        socket.join(userId); // User joins their notification room
        console.log(`User ${userId} connected to notification system`);
      });

      // Listen for incoming encrypted messages (Chat Listening)
      socket.on("sendMessage", async (encryptedMessageData) => {
        // Decrypt the message before saving it or processing it
        const decryptedMessage = decryptMessage(encryptedMessageData.content, secretKey);
        
        // Log the decrypted message for debugging (you may not need this in production)
        console.log("Decrypted Message:", decryptedMessage);

        // Pass the decrypted message to your chat service
        await ChatService.sendMessage(this.io, { ...encryptedMessageData, content: decryptedMessage });
      });

      // Listen for sending encrypted notifications
      socket.on("sendNotification", async (data) => {
        // Encrypt notification content before sending it
        const encryptedMessage = encryptMessage(data.message, secretKey);
        await NotificationService.sendNotification({ ...data, message: encryptedMessage });
      });

      // Listen for marking a notification as read
      socket.on("markNotificationAsRead", async ({ userId, notificationId }) => {
        await NotificationService.markAsRead(userId, notificationId);
      });

      // Handle User Disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });

      socket.on("joinVideoRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined video room: ${roomId}`);
        socket.to(roomId).emit("userJoined", socket.id); // notify others
      });
      
      // Relay WebRTC offer
      socket.on("videoOffer", ({ to, offer }) => {
        socket.to(to).emit("videoOffer", {
          from: socket.id,
          offer,
        });
      });
      
      // Relay WebRTC answer
      socket.on("videoAnswer", ({ to, answer }) => {
        socket.to(to).emit("videoAnswer", {
          from: socket.id,
          answer,
        });
      });
      
      // Relay ICE candidates
      socket.on("iceCandidate", ({ to, candidate }) => {
        socket.to(to).emit("iceCandidate", {
          from: socket.id,
          candidate,
        });
      });
    });
  }
}

let socketInstance = null;

export const init = (server) => {
  if (!socketInstance) {
    socketInstance = new SocketConfig(server);
  }
  return socketInstance;
};

export const getIO = () => {
  if (!socketInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return socketInstance.io;
};
