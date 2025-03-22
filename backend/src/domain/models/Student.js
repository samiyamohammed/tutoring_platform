import mongoose from "mongoose";
import User from "./User.js"; // Adjust the path as necessary

const StudentSchema = new mongoose.Schema({
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }]
});

// Create the Student model using User as a base
const Student = User.discriminator("student", StudentSchema);

// Export it as the default export
export default Student;