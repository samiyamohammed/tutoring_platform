import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import generateToken from '../../infrastructure/config/jwtConfig.js';
import Student from "../../domain/models/Student.js";
import Tutor from "../../domain/models/Tutor.js";
import Admin from "../../domain/models/Admin.js";
import sgMail from '../../infrastructure/config/sendgrid.js';
import { generateOTP } from '../../utils/otp.js';

const ROLE_MODELS = {
  student: Student,
  tutor: Tutor,
  admin: Admin,
};

// Role detection logic
const detectRole = (data) => {
  if (data.role) return data.role; // Explicit role in request
  
  // Implicit detection based on fields
  if (data.studentId) return 'student';
  if (data.teachingSubjects) return 'tutor';
  if (data.isSuperAdmin !== undefined) return 'admin';
  
  throw new Error("Could not determine user role from registration data");
};

class AuthService {
  constructor() {
    // Bind all methods to ensure proper 'this' context
    this.register = this.register.bind(this);
    this.checkExistingEmail = this.checkExistingEmail.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.resendOTP = this.resendOTP.bind(this);
    this.sendVerificationEmail = this.sendVerificationEmail.bind(this);
    this.login = this.login.bind(this);
  }

  async checkExistingEmail(email) {
    for (const model of Object.values(ROLE_MODELS)) {
      const user = await model.findOne({ email });
      if (user) return user;
    }
    return null;
  }

  async register(data) {
    try {
      const role = detectRole(data);
      const Model = ROLE_MODELS[role];
      
      if (!Model) {
        throw new Error("Invalid user role");
      }

      // Check if email exists using the bound method
      const existingUser = await this.checkExistingEmail(data.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password and generate OTP
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const otp = generateOTP();

      const userData = {
        ...data,
        password: hashedPassword,
        otp,
        otpExpiresAt: Date.now() + 10 * 60 * 1000,
        emailVerified: false,
        role
      };

      const user = await Model.create(userData);
      
      // Send verification email
      try {
        await this.sendVerificationEmail(user.email, otp);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
      }

      return {
        success: true,
        message: "Registration successful. Please verify your email.",
        role: user.role,
        userId: user._id,
        email: user.email
      };

    } catch (error) {
      console.error("Registration service error:", error);
      throw error;
    }
  }

  async verifyOTP(email, otp) {
    let user;
    
    for (const model of Object.values(ROLE_MODELS)) {
      user = await model.findOne({ email });
      if (user) break;
    }

    if (!user) throw new Error("User not found");
    if (user.otp !== otp) throw new Error("Invalid OTP");
    if (user.otpExpiresAt < Date.now()) throw new Error("OTP expired");

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { message: "Email verified successfully" };
  }

  async resendOTP(email) {
    let user;
    
    for (const model of Object.values(ROLE_MODELS)) {
      user = await model.findOne({ email });
      if (user) break;
    }

    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await this.sendVerificationEmail(email, otp);
    return { message: "New OTP sent to email" };
  }

  async sendVerificationEmail(email, otp) {
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL
    const msg = {
      to: email,
      from: `${FROM_EMAIL}`,
      subject: 'Your Email Verification Code',
      text: `Your verification code is: ${otp}`,
      html: `<strong>Your verification code is: ${otp}</strong>`,
    };

    await sgMail.send(msg);
  }

  async login(email, password) {
    let user;

    for (const model of Object.values(ROLE_MODELS)) {
      user = await model.findOne({ email });
      if (user) break;
    }

    if (!user) throw new Error("Invalid email or password");
    if (!user.emailVerified) throw new Error("Please verify your email first");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = generateToken(user);
    return { 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name || user.username 
      } 
    };
  }
}

// Export an instance with properly bound methods
export default  AuthService;
