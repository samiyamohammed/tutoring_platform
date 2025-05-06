import EnrollmentService from "../../application/services/EnrollmentService.js";
import Course from "../../domain/models/Course.js";
import Enrollment from "../../domain/models/Enrollment.js";

class EnrollmentController {
  async enrollStudent(req, res) {
    const data = req.body;
    try {
      const enrollment = await EnrollmentService.enrollStudent(data);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getEnrollmentsByTutor(req, res) {
    try {
      console.log("Fetching enrollments for tutor:", req.user._id);
      const tutorId = req.user._id;

      // Step 1: Find all courses taught by the tutor
      const courses = await Course.find({ tutor: tutorId }); // Adjust based on Course schema
      const courseIds = courses.map((course) => course._id);

      // Step 2: Find all enrollments where course is in those courseIds
      const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate("student") // Gets student info
        .populate("course"); // Gets course info

      res.status(200).json(enrollments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get enrollments for tutor" });
    }
  }

  async getEnrollments(req, res) {
    const { studentId } = req.params;
    try {
      const enrollments = await EnrollmentService.getEnrollments(studentId);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEnrollmentStatus(req, res) {
    const { enrollmentId, status } = req.body;
    try {
      const enrollment = await EnrollmentService.updateEnrollmentStatus(
        enrollmentId,
        status
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addProgress(req, res) {
    const { enrollmentId, moduleId, score } = req.body;
    try {
      const progress = await EnrollmentService.addProgress(
        enrollmentId,
        moduleId,
        score
      );
      res.status(200).json(progress);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new EnrollmentController();
