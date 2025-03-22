// src/domain/models/Question.js
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}, { _id: false }); // Prevents creation of a separate ID for each question

const Question = mongoose.model('Question', QuestionSchema);

export default Question;
