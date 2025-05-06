import mongoose from "mongoose";
import User from "./User.js"; // Adjust the path as necessary

const TutorSchema = new mongoose.Schema({
  qualification: { type: String },  // Degree, Certification, etc.
  experience: { type: Number }, // Years of teaching experience
  subjects: [{ type: String }], // List of subjects they teach
  verification_status: {
    type: String,
    enum: ["initial", "requested", "approved", "rejected"],
    default: "initial"
  },
  verification_documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true }
  }],

  ratings: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the student who rated
    rating: { type: Number, min: 1, max: 5 },  // Rating score
    comment: { type: String },  // Optional comment
    date: { type: Date, default: Date.now }  // Rating date
  }],


});

// Create the Tutor model using User as a base
const Tutor = User.discriminator("tutor", TutorSchema);

// Export it as the default export
export default Tutor;
