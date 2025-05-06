import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  sessionType: { type: String, enum: ['video', 'in-person'], required: true }, // Type of session
  requestDate: { type: Date, default: Date.now }, // Date of the request
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }, // Approval status
  scheduledDate: { type: Date }, // Date and time for the scheduled session
  startTime: { type: Date }, // Start time of the session
  endTime: { type: Date }, // End time of the session
  videoConferenceLink: { type: String }, // Link for video sessions
  notes: { type: String }, // Additional notes from the student or tutor
}, { timestamps: true });

// Middleware to create a video conference link if session type is video
SessionSchema.pre('save', function(next) {
  if (this.sessionType === 'video' && this.isNew) {
    // Generate a video conference link (this is a placeholder)
    this.videoConferenceLink = `http://localhost:3000/session/${this._id}`; 
  }
  next();
});

const SessionRequest = mongoose.model("Session", SessionSchema);

export default SessionRequest;
