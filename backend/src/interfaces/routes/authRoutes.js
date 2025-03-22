import express from "express";
import authController from "../controllers/AuthController.js"; 

const router = express.Router();

// Use the instance directly for handling routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;