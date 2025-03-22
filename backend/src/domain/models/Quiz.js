import mongoose from 'mongoose';
const QuizSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true }, // Duration in minutes
    gradingDate: { type: Date, required: true }, // Date when the quiz will be graded
    questions: [QuestionSchema], // Embedded documents for questions
  }, { timestamps: true });
  
  const Quiz = mongoose.model('Quiz', QuizSchema);