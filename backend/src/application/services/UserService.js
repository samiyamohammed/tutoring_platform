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
    return await Tutor.find();
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

  // Add a rating to a tutor
  async addTutorRating(tutorId, ratingData) {
    return await Tutor.findByIdAndUpdate(
      tutorId,
      { $push: { ratings: ratingData } },
      { new: true }
    );
  }

  // Get all ratings for a tutor
  async getTutorRatings(tutorId) {
    const tutor = await User.findById(tutorId).select("ratings");
    if (!tutor) return null;

    return tutor.ratings;
  }

  // Get a specific rating for a tutor
  async getTutorRating(tutorId, ratingId) {
    const tutor = await User.findById(tutorId);
    if (!tutor) return null;

    return tutor.ratings.id(ratingId);
  }

  // Update a rating for a tutor
  async updateTutorRating(tutorId, ratingId, updateData) {
    const tutor = await User.findById(tutorId);
    if (!tutor) return null;

    const rating = tutor.ratings.id(ratingId);
    if (!rating) return null;

    // Update only the provided fields
    if (updateData.rating !== undefined) rating.rating = updateData.rating;
    if (updateData.comment !== undefined) rating.comment = updateData.comment;

    await tutor.save();
    return tutor;
  }

  // Delete a rating from a tutor
  async deleteTutorRating(tutorId, ratingId) {
    return await User.findByIdAndUpdate(
      tutorId,
      { $pull: { ratings: { _id: ratingId } } },
      { new: true }
    );
  }

  // Calculate average rating for a tutor (optional helper method)
  async calculateAverageRating(tutorId) {
    const tutor = await User.findById(tutorId);
    if (!tutor || !tutor.ratings || tutor.ratings.length === 0) {
      return 0;
    }

    const sum = tutor.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / tutor.ratings.length;
  }
}

export default new UserService();
