import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true }, // Text, video URL, PDF, etc.
    order: { type: Number, required: true, min: 1, unique: true }, // Order in course sequence, ensures unique order
}, { timestamps: true });

const Module = mongoose.model('Module', ModuleSchema);

export default Module;  // Use default export
