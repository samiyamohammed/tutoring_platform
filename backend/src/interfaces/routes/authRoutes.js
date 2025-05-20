import express from "express";
import authController from "../controllers/AuthController.js";
import sgMail from '../../infrastructure/config/sendgrid.js';
import jwt from 'jsonwebtoken';
import User from '../../domain/models/User.js';

const router = express.Router();

// Use the instance directly for handling routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post('/verify-email', (req, res) => authController.verifyOTP(req, res));
router.post('/resend-otp', (req, res) => authController.resendOTP(req, res));
router.get('/verify', async (req, res) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.split(" ")[1];
        console.log(token);

        if (!token) return res.status(401).json({ message: "Unauthorized, token missing" });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id).select("-password");
        console.log(user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Add this to your routes (temporarily)



export default router;