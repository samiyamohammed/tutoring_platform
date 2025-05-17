import express from "express";
import authController from "../controllers/AuthController.js"; 
import sgMail from '../../infrastructure/config/sendgrid.js';

const router = express.Router();

// Use the instance directly for handling routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post('/verify-email', (req, res) => authController.verifyOTP(req, res));
router.post('/resend-otp', (req, res) =>  authController.resendOTP(req, res));
// Add this to your routes (temporarily)



export default router;