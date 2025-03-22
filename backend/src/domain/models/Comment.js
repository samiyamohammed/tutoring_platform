import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
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
    }, // Comment on a tutor (optional)

    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      default: null, 
      index: true 
    }, // Comment on a course (optional)

    content: { 
      type: String, 
      required: true, 
      maxlength: 1000,
      validate: {
        validator: function(v) {
          return v.trim().length > 0;
        },
        message: 'Content cannot be empty or whitespace.'
      }
    }, // Comment text

    parentComment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Comment", 
      default: null, 
      index: true 
    }, // Enables replies (null for top-level comments)

    replies: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Comment" 
    }], // List of replies to this comment (optional)

    likes: { 
      type: Set, 
      of: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Set of users who liked the comment

    dislikes: { 
      type: Set, 
      of: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Set of users who disliked the comment

    reportReason: { 
      type: String, 
      maxlength: 500, 
      default: null
    }, // Optional reason for reporting

    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date 
    }
  },
  { timestamps: true }
);

// Create indexes to improve performance of certain queries
CommentSchema.index({ user: 1, tutor: 1 }, { unique: true, sparse: true }); // Prevent duplicate comments per tutor by the same user
CommentSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true }); // Prevent duplicate comments per course by the same user
CommentSchema.index({ parentComment: 1 }); // Improve query speed for replies

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
