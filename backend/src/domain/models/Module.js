import mongoose from "mongoose";
import QuizSchema from "./Quiz.js"; // Reuse your existing QuizSchema

const SectionBaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true, min: 1 },
  type: { type: String, required: true, enum: ['text', 'video', 'pdf', 'quiz'] }
}, { _id: false, discriminatorKey: 'type' });

// Section type schemas
const TextSectionSchema = new mongoose.Schema({
  content: { type: String, required: true }
}, { _id: false });

const VideoSectionSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true }
}, { _id: false });

const PdfSectionSchema = new mongoose.Schema({
  pdfUrl: { type: String, required: true }
}, { _id: false });

// Use QuizSchema as embedded subdocument (if small/unique to module)
const EmbeddedQuizSchema = new mongoose.Schema({
  quiz: QuizSchema
}, { _id: false });

// Module schema
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true, min: 1 },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  sections: [SectionBaseSchema]
}, { timestamps: true });

// Add discriminators for each section type
ModuleSchema.path('sections').discriminator('text', TextSectionSchema);
ModuleSchema.path('sections').discriminator('video', VideoSectionSchema);
ModuleSchema.path('sections').discriminator('pdf', PdfSectionSchema);
ModuleSchema.path('sections').discriminator('quiz', EmbeddedQuizSchema);

export default ModuleSchema;
