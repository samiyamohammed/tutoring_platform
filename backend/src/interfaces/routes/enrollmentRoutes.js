import express from "express";
import enrollmentController from "../controllers/EnrollmentController.js";

const router = express.Router();

router.get("/",  enrollmentController.getAllEnrollments);  // Student enrolls in a course
router.post("/enroll",  enrollmentController.enrollStudent);  // Student enrolls in a course
router.get("/mycourses",  enrollmentController.getEnrollments);  // Get all enrollments for a student
// router.put("/:id",  enrollmentController.updateEnrollment);  // Update enrollment status
router.get("/currentenrollment/:courseId",  enrollmentController.getCurrentEnrollment);  // Get all enrollments for a student
// router.put("/status",  enrollmentController.updateEnrollmentStatus);  // Update enrollment status
// Update progress
router.put('/:enrollmentId/progress', enrollmentController.updateProgress);

// Mark section as complete
router.put('/:enrollmentId/complete-section', enrollmentController.markSectionComplete);

// Add note to section
router.post('/:enrollmentId/add-note', enrollmentController.addNoteToSection);

// Submit quiz
router.post('/:enrollmentId/submit-quiz', enrollmentController.submitQuiz);

export default router;
