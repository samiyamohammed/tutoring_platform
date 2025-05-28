import mongoose from "mongoose";
import User from "./User.js"; // Adjust the path as necessary

const TutorSchema = new mongoose.Schema({
  qualification: { type: String }, // Degree, Certification, etc.
  experience: { type: Number }, // Years of teaching experience
  subjects: [{ type: String }], // List of subjects they teach

  verification_status: {
    type: String,
    enum: ["initial", "requested", "approved", "rejected"],
    default: "initial",
  },

  verification_rejection_reason: {
    type: String,
    default: null,
    validate: {
      validator: function (value) {
        return (
          !value ||
          (this.verification_status && this.verification_status === "rejected")
        );
      },
      message: "Rejection reason can only be set if status is 'rejected'.",
    },
  },

  verification_documents: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],

  ratings: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

// Create the Tutor model using User as a base
const Tutor = User.discriminator("tutor", TutorSchema);

export default Tutor;
