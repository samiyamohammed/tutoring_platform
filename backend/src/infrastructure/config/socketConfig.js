import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../../domain/models/User.js";
import ChatRoom from "../../domain/models/ChatRoom.js";

let io;

function initializeSocket(server) {
  io = new SocketServer(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:5500"], // Specify your frontend origins
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true
    }
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.Authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Authentication error: token missing or invalid format"));
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err);
      next(new Error("Authentication failed"));
    }
  });


  io.on("connection", async (socket) => {
    console.log(`✅ [Connected] User: ${socket.user.name} (${socket.user._id}) | Socket ID: ${socket.id}`);

    // Join user's personal room for notifications
    socket.join(`user_${socket.user._id}`);

    // Join all chat rooms the user is part of
    try {
      const rooms = await ChatRoom.find({ members: socket.user._id });
      rooms.forEach(room => {
        socket.join(room._id.toString());
        console.log(`🔗 User ${socket.user._id} joined room ${room._id}`);
      });
    } catch (err) {
      console.error("Error joining rooms:", err);
    }

    // Message handling
    socket.on("send-message", async (messageData) => {
      try {
        const { roomId, content } = messageData;

        // Verify user is in this room
        const room = await ChatRoom.findOne({
          _id: roomId,
          members: socket.user._id
        });

        if (!room) {
          throw new Error("Not authorized for this room");
        }

        // Broadcast to room
        io.to(roomId).emit("receive-message", {
          content,
          sender: socket.user,
          roomId,
          timestamp: new Date()
        });

      } catch (err) {
        console.error("Message sending error:", err);
        socket.emit("message-error", err.message);
      }
    });

    // Typing indicators
    socket.on("typing", (roomId) => {
      socket.to(roomId).emit("userTyping", {
        userId: socket.user._id,
        name: socket.user.name,
        roomId
      });
    });

    socket.on("stopTyping", (roomId) => {
      socket.to(roomId).emit("userStoppedTyping", {
        userId: socket.user._id,
        roomId
      });
    });

    // Disconnection
    socket.on("disconnect", () => {
      console.log(`⚠️ [Disconnected] User: ${socket.user.name} (${socket.user._id})`);
    });

    // Error handling
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  return io;
}

export { initializeSocket as init, io };