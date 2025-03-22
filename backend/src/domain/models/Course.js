import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  price: { type: Number, required: true },
  schedule: { type: [{ date: Date, time: String }] },
  prerequisites: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  capacity: { type: Number, required: true },
  waitingListCapacity: { type: Number, default: 0 },
  currentEnrollment: { type: Number, default: 0 },
  waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WaitingList' }],
}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);

// Default export
export default Course;