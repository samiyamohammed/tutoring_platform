import express from "express";
import enrollmentController from "../controllers/EnrollmentController.js";

const router = express.Router();

router.post("/enroll", enrollmentController.enrollStudent); // Student enrolls in a course
router.get("/tutor", enrollmentController.getEnrollmentsByTutor);
router.get("/:studentId", enrollmentController.getEnrollments); // Get all enrollments for a student
router.put("/status", enrollmentController.updateEnrollmentStatus); // Update enrollment status
router.put("/progress", enrollmentController.addProgress); // Add progress (e.g., module completion)

export default router;
