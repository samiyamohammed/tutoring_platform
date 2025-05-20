import Course from "../../domain/models/Course.js";
import mongoose from 'mongoose';
const { Types } = mongoose;

class CourseRepository {
  async create(courseData) {
    return await Course.create(courseData);
  }
  async findAll() {
    return await Course.find();
  }
  async findById(id) {
    return await Course.findById(id);
  }

  async findByTutorId(tutorId) {
  try {
    // Validate the tutorId is a proper ObjectId
    if (!Types.ObjectId.isValid(tutorId)) {
      throw new Error('Invalid tutor ID format');
    }

    // Convert to ObjectId
    const objectIdTutorId = new Types.ObjectId(tutorId);

    const courses = await Course.find({ tutor: tutorId })
        
    return courses;
  } catch (error) {
    console.error('Error finding courses by tutor:', error);
    throw error;
  }
}

  async update(id, courseData) {
    return await Course.findByIdAndUpdate(id, courseData, { new: true });
  }
  async delete(id) {
    return await Course.findByIdAndDelete(id);
  }
}

export default new CourseRepository();