import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../../domain/models/User.js";
import ChatRoom from "../../domain/models/ChatRoom.js";
import Message from "../../domain/models/Message.js";
import Session from "../../domain/models/Session.js";
import NotificationRepository from "../../infrastructure/repositories/NotificationRepository.js";
import mongoose from "mongoose";

let io;

function initializeSocket(server) {
  io = new SocketServer(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    }
  });

  // Track active video sessions
  const activeSessions = new Map();

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

    // ======================
    // VIDEO SESSION HANDLERS
    // ======================
    socket.on("join-session", async ({ sessionId }) => {
      try {
        // Validate session exists and is a video session
        const session = await Session.findById(sessionId)
          .populate('student tutor course')
          .lean();

        if (!session) throw new Error("Session not found");
        if (session.sessionType !== 'video') throw new Error("Not a video session");

        // Verify user is authorized for this session
        const userIdStr = socket.user._id.toString();
        const isTutor = session.tutor._id.equals(socket.user._id);
        const isStudent = session.student._id.equals(socket.user._id);

        if (!isTutor && !isStudent) {
          throw new Error("Not authorized for this session");
        }

        // Initialize or get session data
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, {
            session,
            participants: new Map(),
            chatMessages: []
          });
        }

        const sessionData = activeSessions.get(sessionId);

        // Check if user already exists in participants
        const existingParticipant = sessionData.participants.get(userIdStr);

        if (existingParticipant) {
          // Update socket ID if reconnecting
          existingParticipant.socketId = socket.id;
        } else {
          // Add new participant with proper role identification
          sessionData.participants.set(userIdStr, {
            socketId: socket.id,
            user: {
              _id: socket.user._id,
              name: socket.user.name,
              avatar: socket.user.avatar,
              role: isTutor ? 'tutor' : 'student' // Explicit role identification
            },
            isTutor,
            isCameraOn: false,
            isMicOn: false,
            isScreenSharing: false
          });
        }

        // Join the session room
        socket.join(sessionId);

        // Prepare participants list without the current user for the "you" display
        const otherParticipants = Array.from(sessionData.participants.entries())
          .filter(([id]) => id !== userIdStr)
          .map(([_, p]) => ({
            userId: p.user._id,
            name: p.user.name,
            avatar: p.user.avatar,
            isTutor: p.isTutor,
            isCameraOn: p.isCameraOn,
            isMicOn: p.isMicOn,
            isScreenSharing: p.isScreenSharing,
            role: p.user.role // Include role in participant data
          }));

        // Send session state to the joining participant
        socket.emit("session-state", {
          session,
          currentUser: {
            userId: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar,
            isTutor,
            role: isTutor ? 'tutor' : 'student'
          },
          participants: otherParticipants,
          chatMessages: sessionData.chatMessages,
          isTutor
        });

        // Notify others about the new/updated participant (excluding self)
        socket.to(sessionId).emit("participant-joined", {
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar,
            isTutor,
            role: isTutor ? 'tutor' : 'student'
          },
          isReconnect: !!existingParticipant
        });

        // Update session status if needed
        if (session.status === 'pending') {
          await Session.findByIdAndUpdate(sessionId, { status: 'approved' });
        }

      } catch (err) {
        console.error("Join session error:", err);
        socket.emit("session-error", {
          message: err.message,
          code: err.code || 'SESSION_JOIN_ERROR'
        });
      }
    });

    socket.on("leave-session", ({ sessionId }) => {
      if (!activeSessions.has(sessionId)) return;

      const sessionData = activeSessions.get(sessionId);
      sessionData.participants.delete(socket.user._id.toString());

      // Notify remaining participants
      io.to(sessionId).emit("participant-left", {
        userId: socket.user._id
      });

      // Clean up if empty
      if (sessionData.participants.size === 0) {
        activeSessions.delete(sessionId);
      }
    });

    socket.on("toggle-media", ({ sessionId, mediaType, state }) => {
      if (!activeSessions.has(sessionId)) return;

      const sessionData = activeSessions.get(sessionId);
      const participant = sessionData.participants.get(socket.user._id.toString());
      if (!participant) return;

      // Update media state
      switch (mediaType) {
        case 'camera': participant.isCameraOn = state; break;
        case 'mic': participant.isMicOn = state; break;
        case 'screen': participant.isScreenSharing = state; break;
      }

      // Broadcast the update
      io.to(sessionId).emit("media-updated", {
        userId: socket.user._id,
        mediaType,
        state
      });
    });

    socket.on("send-signal", ({ sessionId, toUserId, signal }) => {
      if (!activeSessions.has(sessionId)) return;

      const sessionData = activeSessions.get(sessionId);
      const targetParticipant = sessionData.participants.get(toUserId);
      if (!targetParticipant) return;

      // Forward the signaling data to the target participant
      io.to(targetParticipant.socketId).emit("receive-signal", {
        fromUserId: socket.user._id,
        signal: {
          ...signal,
          // Ensure these fields are included for ICE candidates
          sdpMid: signal.sdpMid || null,
          sdpMLineIndex: signal.sdpMLineIndex || null
        }
      });
    });

    socket.on("return-signal", ({ sessionId, toUserId, signal }) => {
      if (!activeSessions.has(sessionId)) return;

      const sessionData = activeSessions.get(sessionId);
      const targetParticipant = sessionData.participants.get(toUserId);
      if (!targetParticipant) return;

      io.to(targetParticipant.socketId).emit("receive-return-signal", {
        fromUserId: socket.user._id,
        signal
      });
    });

    socket.on("send-chat-message", async ({ sessionId, message }) => {
      try {
        if (!activeSessions.has(sessionId)) throw new Error("Session not found");

        const sessionData = activeSessions.get(sessionId);
        const isTutor = sessionData.session.tutor._id.equals(socket.user._id);

        // Create message record
        const newMessage = {
          _id: new mongoose.Types.ObjectId(),
          sender: socket.user._id,
          name: socket.user.name,
          isTutor,
          content: message,
          timestamp: new Date()
        };

        // Add to chat history
        sessionData.chatMessages.push(newMessage);

        // Broadcast to all participants
        io.to(sessionId).emit("new-chat-message", newMessage);

        // Persist to database
        await Message.create({
          session: sessionId,
          sender: socket.user._id,
          content: message
        });

      } catch (err) {
        console.error("Chat message error:", err);
        socket.emit("chat-error", err.message);
      }
    });

    socket.on("end-session", async ({ sessionId }) => {
      try {
        if (!activeSessions.has(sessionId)) throw new Error("Session not found");

        const sessionData = activeSessions.get(sessionId);

        // Verify requester is tutor
        if (!sessionData.session.tutor._id.equals(socket.user._id)) {
          throw new Error("Only tutor can end session");
        }

        // Update session status in database
        await Session.findByIdAndUpdate(sessionId, {
          status: 'completed',
          endTime: new Date()
        });

        // Notify all participants
        io.to(sessionId).emit("session-ended");

        // Clean up
        activeSessions.delete(sessionId);

      } catch (err) {
        console.error("End session error:", err);
        socket.emit("session-error", err.message);
      }
    });

    // ======================
    // CHAT MESSAGE HANDLERS
    // ======================
    socket.on("send-message", async (messageData) => {
      try {
        const { roomId, content, tempId } = messageData;

        // Verify user is in this room
        const room = await ChatRoom.findOne({
          _id: roomId,
          members: socket.user._id
        });

        if (!room) {
          throw new Error("Not authorized for this room");
        }

        // Create message in database
        const message = await Message.create({
          sender: socket.user._id,
          room: roomId,
          content
        });

        // Populate sender info
        const populatedMessage = await Message.populate(message, {
          path: 'sender',
          select: 'name avatar'
        });

        // Broadcast to room with consistent format
        io.to(roomId).emit("receive-message", {
          _id: populatedMessage._id,
          tempId,
          content: populatedMessage.content,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          room: roomId,
          createdAt: populatedMessage.createdAt
        });

      } catch (err) {
        console.error("Message sending error:", err);
        socket.emit("message-error", err.message);
      }
    });

    socket.on("updateMessage", async (updateData) => {
      try {
        const { messageId, content } = updateData;

        // Verify user is the sender of this message
        const message = await Message.findOneAndUpdate(
          {
            _id: messageId,
            sender: socket.user._id,
            deleted: false
          },
          {
            content,
            edited: true,
            editedAt: new Date()
          },
          { new: true }
        ).populate('sender', 'name avatar');

        if (!message) {
          throw new Error("Message not found or you don't have permission to edit it");
        }

        // Broadcast updated message to room
        io.to(message.room.toString()).emit("messageUpdated", {
          _id: message._id,
          content: message.content,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            avatar: message.sender.avatar
          },
          room: message.room,
          createdAt: message.createdAt,
          edited: true,
          editedAt: message.editedAt
        });

      } catch (err) {
        console.error("Message update error:", err);
        socket.emit("message-error", err.message);
      }
    });

    socket.on("deleteMessage", async (messageId) => {
      try {
        // Check if user is sender or admin in the room
        const message = await Message.findOne({
          _id: messageId,
          deleted: false
        });

        if (!message) {
          throw new Error("Message not found");
        }

        // Check if user is sender or admin
        const isSender = message.sender.toString() === socket.user._id.toString();
        const isAdmin = await ChatRoom.exists({
          _id: message.room,
          admins: socket.user._id
        });

        if (!isSender && !isAdmin) {
          throw new Error("Not authorized to delete this message");
        }

        // Soft delete the message
        const deletedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            deleted: true,
            deletedAt: new Date(),
            content: "This message has been deleted"
          },
          { new: true }
        );

        // Broadcast deletion to room
        io.to(message.room.toString()).emit("messageDeleted", {
          _id: message._id,
          room: message.room,
          deleted: true,
          content: "This message has been deleted"
        });

      } catch (err) {
        console.error("Message deletion error:", err);
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

    // ======================
    // NOTIFICATION HANDLERS
    // ======================
    socket.on("markNotificationAsRead", async ({ notificationId }) => {
      try {
        await NotificationRepository.markNotificationAsRead(socket.user._id, notificationId);
        io.to(`user_${socket.user._id}`).emit("notificationRead", {
          userId: socket.user._id,
          notificationId
        });
      } catch (err) {
        console.error("Notification read error:", err);
        socket.emit("notification-error", err.message);
      }
    });

    // ======================
    // DISCONNECTION HANDLER
    // ======================
    socket.on("disconnect", () => {
      console.log(`⚠️ [Disconnected] User: ${socket.user.name} (${socket.user._id})`);

      // Clean up any sessions this user was in
      activeSessions.forEach((sessionData, sessionId) => {
        if (sessionData.participants.has(socket.user._id.toString())) {
          sessionData.participants.delete(socket.user._id.toString());

          io.to(sessionId).emit("participant-left", {
            userId: socket.user._id
          });

          if (sessionData.participants.size === 0) {
            activeSessions.delete(sessionId);
          }
        }
      });
    });

    // Error handling
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  return io;
}

export { initializeSocket as init, io };