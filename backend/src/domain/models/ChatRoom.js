import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      }
    ],
    name: { 
      type: String,
      required: function() { return this.isGroupChat; }
    },
    isGroupChat: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    avatar: String,
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster querying
ChatRoomSchema.index({ members: 1 });
ChatRoomSchema.index({ lastMessage: 1 });

// Virtual: other participant in a 1-on-1 chat
ChatRoomSchema.virtual('otherParticipant').get(function() {
  if (!this.isGroupChat && this.members) {
    return this.members.find(member => !member.equals(this.createdBy));
  }
  return null;
});

// Static method: find or create 1-on-1 chat
ChatRoomSchema.statics.findOrCreatePrivateChat = async function(user1, user2) {
  const existingChat = await this.findOne({
    isGroupChat: false,
    members: { $all: [user1, user2], $size: 2 }
  }).populate('members');

  if (existingChat) return existingChat;

  return this.create({
    members: [user1, user2],
    isGroupChat: false,
    createdBy: user1
  });
};

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
export default ChatRoom;
