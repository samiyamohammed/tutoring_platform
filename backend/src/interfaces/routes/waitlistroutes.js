import express from "express";
import waitingListController from "../controllers/waitlistController";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Join waitlist
router.post("/:courseId", waitingListController.joinWaitlist);

// Leave waitlist
router.delete("/:courseId", waitingListController.leaveWaitlist);

// Get user's waitlist status for a course
router.get("/status/:courseId", waitingListController.getWaitlistStatus);

// Get all users on a course's waitlist (admin only)
router.get("/course/:courseId", waitingListController.getCourseWaitlist);

// Get all courses a user is waitlisted for
router.get("/user", waitingListController.getUserWaitlist);

export default router;
