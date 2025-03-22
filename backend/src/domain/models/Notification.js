import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Empty = system-wide
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Tracks users who read
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipients: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema); // ✅ Use ES Module Export
