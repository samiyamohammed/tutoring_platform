import { Server as SocketServer } from "socket.io";

let io;

function initializeSocket(server) {
  io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ [Connected] Socket ID: ${socket.id}`);

    // Join room
    socket.on("join-chat", (roomId) => {
      socket.join(roomId);
      console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
    });

    // Typing
    socket.on("typing", (roomId) => {
      socket.to(roomId).emit("userTyping", { socketId: socket.id, roomId });
    });

    socket.on("stopTyping", (roomId) => {
      socket.to(roomId).emit("userStoppedTyping", { socketId: socket.id, roomId });
    });

    // Message sending
    socket.on("send-message", (message) => {
      const { content, chat, sender } = message;
      console.log(`💬 Message from ${sender._id}: ${content}`);
      io.to(chat._id).emit("receive-message", message);
    });

    // Message delivery (mocked)
    socket.on("messageDelivered", (messageId) => {
      console.log(`📬 Message ${messageId} marked delivered by ${socket.id}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`⚠️ [Disconnected] Socket ID: ${socket.id}`);
    });

    // Error
    socket.on("error", (err) => {
      console.error("❗ Socket error:", err.message);
    });
  });

  return io;
}

export { initializeSocket as init, io };
