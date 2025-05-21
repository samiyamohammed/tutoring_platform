// src/domain/models/Session.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  sessionType: { type: String, enum: ['video', 'in-person'], required: true }, 
  requestDate: { type: Date, default: Date.now }, 
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }, // Approval status
  scheduledDate: { type: Date }, // Date and time for the scheduled session
  notes: { type: String }, // Additional notes from the student or tutor
}, { timestamps: true });

const SessionRequest = mongoose.model("Session", SessionSchema);

export default SessionRequest;
