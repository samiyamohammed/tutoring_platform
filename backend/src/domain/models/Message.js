import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    room: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ChatRoom", 
      required: true 
    },
    content: { type: String },
    attachments: [{
      type: { type: String, enum: ['image', 'video', 'file', 'audio'] },
      url: String,
      name: String,
      size: Number
    }],
    readBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String
    }],
    replyTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
    edited: { type: Boolean, default: false },
    editedAt: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ readBy: 1 });

// Pre-save hook
MessageSchema.pre('save', async function(next) {
  if (this.isNew) {
    await mongoose.model('ChatRoom').findByIdAndUpdate(
      this.room,
      { lastMessage: this._id },
      { new: true }
    );
  }
  next();
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;
