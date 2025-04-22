import mongoose from "mongoose";
import ModuleSchema from "./Module.js";
import QuizSchema from "./Quiz.js";

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // New field for category
  level: { type: String, required: true }, // New field for level
  deadline: { type: Date, required: true }, // New field for deadline
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [ModuleSchema],
  quizzes: [QuizSchema],
  sessionTypes: [{ // Array of session types with pricing and schedules
    type: String,
    enum: ['online', 'group', 'oneOnOne'],
    required: true,
  }],
  pricing: {
    online: {
      price: { type: Number, min: 0 },
      maxStudents: { type: Number, min: 1 },
      schedule: [{ // Schedule for online sessions
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      }],
    },
    group: {
      price: { type: Number, min: 0 },
      maxStudents: { type: Number, min: 1 },
      schedule: [{ // Schedule for group sessions
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      }],
    },
    oneOnOne: {
      price: { type: Number, min: 0 },
      maxStudents: { type: Number, min: 1 },
      schedule: [{ // Schedule for one-on-one sessions
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      }],
    },
  },
  prerequisites: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  capacity: { type: Number },
  waitingListCapacity: { type: Number, default: 0 },
  currentEnrollment: { type: Number, default: 0 },
  waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WaitingList' }],
}, { timestamps: true });

CourseSchema.pre(/^find/, function(next) {
  this.populate('tutor', 'name email') // Modify here to include fields you want from User // Populate modules if needed
  next();
});

const Course = mongoose.model('Course', CourseSchema);

// Default export
export default Course;