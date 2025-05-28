import mongoose from "mongoose";

// Define schema for each question
const AssessmentQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "shortAnswer"],
    required: true,
  },
  options: [
    {
      type: String,
      required: function () {
        return this.type === "mcq";
      },
    },
  ], // Only for MCQs
  correctAnswer: { type: String }, // Optional
});

// Define schema for assessments inside course
const AssessmentSchema = new mongoose.Schema({
  preAssessment: [AssessmentQuestionSchema],  // multiple questions
  postAssessment: [AssessmentQuestionSchema], // multiple questions
});

export default AssessmentSchema;
