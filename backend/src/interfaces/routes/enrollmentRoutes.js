import express from 'express';
import enrollmentController from '../controllers/EnrollmentController.js';

const router = express.Router();

router.get("/",  enrollmentController.getAllEnrollments);  // Student enrolls in a course
router.post("/enroll",  enrollmentController.enrollStudent);  // Student enrolls in a course
router.get("/:studentId",  enrollmentController.getEnrollments);  // Get all enrollments for a student
router.put("/status",  enrollmentController.updateEnrollmentStatus);  // Update enrollment status
router.put("/progress",  enrollmentController.addProgress);  // Add progress (e.g., module completion)

export default router;
