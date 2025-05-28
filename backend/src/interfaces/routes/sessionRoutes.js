// src/interfaces/routes/sessionRoutes.js
import express from "express";
import SessionController from "../controllers/SessionController.js";

const router = express.Router();

router.post("/", SessionController.create); // Create a new session
router.get("/", SessionController.getAll); // Get all session requests
router.get("/tutor", SessionController.getByTutorId); // Get sessions by user ID
router.get("/student", SessionController.getByStudentId); // Get sessions by user ID
router.get("/:id", SessionController.getById); // Get session by ID
router.put("/:id", SessionController.update); // Update session by ID
router.delete("/:id", SessionController.delete); // Delete session by ID

export default router;
