import mongoose from "mongoose";

const FinalExamQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 },
});

const FinalExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  passingScore: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  questions: [FinalExamQuestionSchema],
  isPublished: { type: Boolean, default: false },
});

export default FinalExamSchema;