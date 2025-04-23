import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true, min: 1 },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: false }); // Disable _id for embedded documents


export default ModuleSchema;