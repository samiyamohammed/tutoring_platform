import User from "../../domain/models/User.js"; // Adjust the path as necessary
import Tutor from "../../domain/models/Tutor.js"; // Adjust the path as necessary
import Student from "../../domain/models/Student.js"; // Adjust the path as necessary
import Admin from "../../domain/models/Admin.js"; // Adjust the path as necessary

class UserService {
  async getUserById(userId) {
    let user = await Student.findById(userId);
    if (!user) user = await Tutor.findById(userId);
    if (!user) user = await Admin.findById(userId);
    return user;
  }

  async getAllStudents() {
    return await Student.find();
  }

  // Get all tutors
  async getAllTutors() {
    return await User.find({ role: "tutor" });
  }

  // Get all admins
  async getAllAdmins() {
    return await Admin.find();
  }

  // Get all users (optional, but useful for admin purposes)
  async getAllUsers() {
    const students = await Student.find();
    const tutors = await Tutor.find();
    const admins = await Admin.find();
    return [...students, ...tutors, ...admins]; // Combine users from all roles
  }

  // Update user information
  async updateUser(userId, updateData) {
    let user = await Student.findById(userId);
    if (!user) user = await Tutor.findById(userId);
    if (!user) user = await Admin.findById(userId);

    if (!user) return null;

    // Update user data
    Object.assign(user, updateData);
    return await user.save();
  }

  // Delete a user
  async deleteUser(userId) {
    let user = await Student.findById(userId);
    if (!user) user = await Tutor.findById(userId);
    if (!user) user = await Admin.findById(userId);

    if (!user) return null;

    // Delete user
    const model = user.constructor;
    await model.deleteOne({ _id: userId });

    return user;
  }
  async getUserWithPassword(userId) {
    return User.findById(userId).select("+password");
  }
}

export default new UserService();
