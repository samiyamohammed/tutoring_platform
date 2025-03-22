import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    tutor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null, 
      index: true 
    }, // Rating for a tutor (optional)

    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      default: null, 
      index: true 
    }, // Rating for a course (optional)

    rating: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    }, // Rating from 1 to 5

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent duplicate ratings for the same tutor/course by the same user
RatingSchema.index({ user: 1, tutor: 1 }, { unique: true, sparse: true });
RatingSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });

const Rating = mongoose.model("Rating", RatingSchema);
export default Rating;
