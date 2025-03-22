const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    name: { 
      type: String, 
      required: function () { return this.members.length > 2; } // Name required only for group chats
    },
    isGroupChat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure unique room for 1-on-1 chats
ChatRoomSchema.index({ members: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
