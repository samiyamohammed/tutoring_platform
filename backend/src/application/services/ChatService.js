import Message from "../../domain/models/Message.js";
import ChatRoom from "../../domain/models/ChatRoom.js";
import User from "../../domain/models/User.js";

class ChatService {
  constructor(io) {
    this.io = io;
  }

  // Chat Room Operations
  async createPrivateChat(user1, user2) {
    try {
      return await ChatRoom.findOrCreatePrivateChat(user1, user2);
    } catch (error) {
      console.error("Error creating private chat:", error);
      return { error: "Failed to create private chat" };
    }
  }

  async createGroupChat(creatorId, participantIds, name, avatar = null) {
    try {
      const allParticipants = [...new Set([creatorId, ...participantIds])];

      if (allParticipants.length < 2) {
        return { error: "Group chat must have at least 2 participants" };
      }

      const chat = await ChatRoom.create({
        members: allParticipants,
        isGroupChat: true,
        name,
        avatar,
        createdBy: creatorId,
        admins: [creatorId]
      });

      return await chat.populate('members');
    } catch (error) {
      console.error("Error creating group chat:", error);
      return { error: "Failed to create group chat" };
    }
  }

  async getChatRoomsForUser(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      return await ChatRoom.find({ members: userId })
        .populate('members', 'name email avatar')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return { error: "Failed to fetch chat rooms" };
    }
  }

  async getChatRoomDetails(roomId, userId) {
    try {
      const room = await ChatRoom.findOne({
        _id: roomId,
        members: userId
      }).populate('members admins createdBy');

      if (!room) {
        return { error: "Chat room not found or access denied" };
      }

      return room;
    } catch (error) {
      console.error("Error fetching chat room details:", error);
      return { error: "Failed to fetch chat room details" };
    }
  }

  // Message Operations
  async sendMessage(roomId, senderId, content, attachments = [], replyTo = null) {
    try {
      const room = await ChatRoom.findOne({
        _id: roomId,
        members: senderId
      });

      if (!room) {
        throw new Error("You are not a member of this chat");
      }

      const message = await Message.create({
        sender: senderId,
        room: roomId,
        content,
        attachments,
        replyTo
      });

      const populatedMessage = await Message.populate(message, {
        path: 'sender',
        select: 'name avatar'
      });

      // Make sure io is available and has the to() method
      if (this.io && typeof this.io.to === 'function') {
        this.io.to(roomId.toString()).emit('newMessage', populatedMessage);
      } else {
        console.error('Socket.IO instance is not properly initialized');
      }

      await this.updateUnreadCounts(roomId, senderId);

      return populatedMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error; // Re-throw the error to be caught by the controller
    }
  }

  async updateUnreadCounts(roomId, excludedUserId) {
    try {
      const room = await ChatRoom.findById(roomId);

      for (const memberId of room.members) {
        if (memberId.toString() !== excludedUserId.toString()) {
          room.unreadCounts.set(
            memberId.toString(),
            (room.unreadCounts.get(memberId.toString()) || 0) + 1
          );
        }
      }

      await room.save();
    } catch (error) {
      console.error("Error updating unread counts:", error);
    }
  }

  async getMessages(roomId, userId, page = 1, limit = 50) {
    try {
      const isMember = await ChatRoom.exists({
        _id: roomId,
        members: userId
      });

      if (!isMember) {
        return { error: "You are not a member of this chat" };
      }

      const skip = (page - 1) * limit;

      return await Message.find({ room: roomId, deleted: false })
        .populate('sender', 'name avatar')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Error getting messages:", error);
      return { error: "Failed to fetch messages" };
    }
  }

  async markMessagesAsRead(roomId, userId, messageIds = []) {
    try {
      if (messageIds.length > 0) {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            room: roomId,
            readBy: { $ne: userId }
          },
          { $addToSet: { readBy: userId } }
        );
      }

      await ChatRoom.findByIdAndUpdate(roomId, {
        $set: { [`unreadCounts.${userId}`]: 0 }
      });

      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return { error: "Failed to mark messages as read" };
    }
  }

  async editMessage(messageId, senderId, newContent) {
    try {
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          sender: senderId,
          deleted: false
        },
        {
          content: newContent,
          edited: true,
          editedAt: new Date()
        },
        { new: true }
      ).populate('sender', 'name avatar');

      if (!message) {
        return { error: "Message not found or you don't have permission to edit it" };
      }

      this.io.to(message.room.toString()).emit('messageUpdated', message);
      return message;
    } catch (error) {
      console.error("Error editing message:", error);
      return { error: "Failed to edit message" };
    }
  }

  async deleteMessage(messageId, userId) {
    try {
      const chatRooms = await ChatRoom.find({ admins: userId }).select('_id');
      const roomIds = chatRooms.map(room => room._id);

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          $or: [
            { sender: userId },
            { room: { $in: roomIds } }
          ]
        },
        {
          deleted: true,
          deletedAt: new Date(),
          content: "This message has been deleted"
        },
        { new: true }
      );

      if (!message) {
        return { error: "Message not found or you don't have permission to delete it" };
      }

      this.io.to(message.room.toString()).emit('messageDeleted', message._id);
      return message;
    } catch (error) {
      console.error("Error deleting message:", error);
      return { error: "Failed to delete message" };
    }
  }

  async addReaction(messageId, userId, emoji) {
    try {
      const message = await Message.findOneAndUpdate(
        { _id: messageId, deleted: false },
        {
          $pull: { reactions: { user: userId } },
          $push: { reactions: { user: userId, emoji } }
        },
        { new: true }
      ).populate('reactions.user', 'name avatar');

      if (!message) {
        return { error: "Message not found" };
      }

      this.io.to(message.room.toString()).emit('reactionAdded', {
        messageId: message._id,
        reactions: message.reactions
      });

      return message;
    } catch (error) {
      console.error("Error adding reaction:", error);
      return { error: "Failed to add reaction" };
    }
  }
}

export default ChatService;
