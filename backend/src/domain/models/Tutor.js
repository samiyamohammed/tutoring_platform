import mongoose from "mongoose";
import User from "./User.js"; // Adjust the path as necessary

const TutorSchema = new mongoose.Schema({
  qualification: { type: String },  // Degree, Certification, etc.
  experience: { type: Number  }, // Years of teaching experience
  subjects: [{ type: String }], // List of subjects they teach
  resume: { type: String }, // Resume file URL
  verification_status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  verification_documents: [{ type: String }] // File URLs
});

// Create the Tutor model using User as a base
const Tutor = User.discriminator("tutor", TutorSchema);

// Export it as the default export
export default Tutor;