import mongoose from "mongoose";
import User from "./User.js"; // Adjust the path as necessary

const AdminSchema = new mongoose.Schema({
  permissions: [
    { type: String, enum: ["approve_tutors", "manage_courses", "delete_users"] }
  ]
});

// Create the Admin model using User as a base
const Admin = User.discriminator("admin", AdminSchema);

// Export it as the default export
export default Admin;