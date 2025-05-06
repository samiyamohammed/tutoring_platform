import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  questionType: String,
  options: [String],
  correctAnswers: [String], // Array for actual use
  points: Number,
  explanation: String
}, { timestamps: true });

// Exporting the Question schema directly, not as a model
export default QuestionSchema;