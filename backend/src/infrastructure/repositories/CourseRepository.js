import Course from "../../domain/models/Course.js";

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
  async update(id, courseData) {
    return await Course.findByIdAndUpdate(id, courseData, { new: true });
  }
  async delete(id) {
    return await Course.findByIdAndDelete(id);
  }
}

export default new CourseRepository();