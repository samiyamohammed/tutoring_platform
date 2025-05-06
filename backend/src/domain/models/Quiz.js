import mongoose from 'mongoose';
import QuestionSchema from './Question.js'; // Import the Question schema

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true, min: 1 },
  duration: { type: Number, required: true },
  questions: [QuestionSchema], // Embed the QuestionSchema
}, { timestamps: true });


export default QuizSchema;