import express from "express";
import courseController from "../controllers/CourseController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import moduleRoutes from "./moduleRoutes.js"; // Import the moduleRoutes file

const router = express.Router();

// Course routes
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);
router.post("/:courseId/modules", courseController.addModule);
router.get("/:courseId/modules", courseController.getModules);
router.get("/:courseId/modules/:moduleId", courseController.getModuleById);
router.put("/:courseId/modules/:moduleId", courseController.updateModule);
router.delete("/:courseId/modules/:moduleId", courseController.deleteModule);
router.put("/:id", authorize(["admin", "tutor"]), courseController.update);
router.delete("/:id", authorize(["admin", "tutor"]), courseController.delete);
router.post("/", authorize(["admin", "tutor"]), courseController.create);

// Route for handling `/api/course/module` requests
router.use("/module", moduleRoutes); // Forward requests to moduleRoutes.js

export default router;
