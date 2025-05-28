import CourseRepository from "../../infrastructure/repositories/CourseRepository.js";
import Course from "../../domain/models/Course.js";

class CourseService {
  async createCourse(courseData) {
    return await CourseRepository.create(courseData);
  }

  async getCourses() {
    return await CourseRepository.findAll();
  }

  async getCourseById(id) {
    return await CourseRepository.findById(id);
  }

  async getTutorCourses(tutorId) {
    const courses = await CourseRepository.findByTutorId(tutorId);
    if (!courses) throw new Error("No courses found for this tutor");
    return courses;
  }

  async updateCourse(id, userId, updateData) {
    const course = await CourseRepository.findById(id);
    console.log("Course Tutor ID:", course.tutor._id.toString());
    console.log("User ID:", userId);
    if (!course || course.tutor._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You are not the tutor of this course");
    }
    return await CourseRepository.update(id, updateData);
  }

  async deleteCourse(id, userId) {
    const course = await CourseRepository.findById(id);
    return await CourseRepository.delete(id);
  }

  async addFinalExam(courseId, finalExamData) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.finalExam = finalExamData;
    await course.save();
    return course;
  }

  async updateFinalExam(courseId, finalExamUpdates) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.finalExam = { ...course.finalExam.toObject(), ...finalExamUpdates };
    await course.save();
    return course;
  }

  async deleteFinalExam(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.finalExam = undefined;
    await course.save();
    return course;
  }

  async addAssessment(courseId, assessmentData) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.assessment = assessmentData;
    await course.save();
    return course;
  }

  async updateAssessment(courseId, assessmentUpdates) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.assessment = {
      ...course.assessment.toObject(),
      ...assessmentUpdates,
    };
    await course.save();
    return course;
  }

  async deleteAssessment(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.assessment = undefined;
    await course.save();
    return course;
  }
}

export default new CourseService();
