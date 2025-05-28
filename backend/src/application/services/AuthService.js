import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import generateToken from '../../infrastructure/config/jwtConfig.js';
import Student from "../../domain/models/Student.js";
import Tutor from "../../domain/models/Tutor.js";
import Admin from "../../domain/models/Admin.js";
import sgMail from '../../infrastructure/config/sendgrid.js';
import { generateOTP } from '../../utils/otp.js';
import User from "../../domain/models/User.js";

const ROLE_MODELS = {
  student: Student,
  tutor: Tutor,
  admin: Admin,
};

// Role detection logic
const detectRole = (data) => {
  if (data.role) return data.role;
  if (data.studentId) return 'student';
  if (data.teachingSubjects) return 'tutor';
  if (data.isSuperAdmin !== undefined) return 'admin';
  throw new Error("Could not determine user role from registration data");
};

class AuthService {
  // Convert methods to arrow functions to auto-bind 'this'
  checkExistingEmail = async (email) => {
    for (const model of Object.values(ROLE_MODELS)) {
      const user = await model.findOne({ email });
      if (user) return user;
    }
    return null;
  };

  register = async (data) => {
    try {
      const role = detectRole(data);
      const Model = ROLE_MODELS[role];
      
      if (!Model) throw new Error("Invalid user role");

      const existingUser = await this.checkExistingEmail(data.email);
      if (existingUser) throw new Error("Email already registered");

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
      
      try {
        console.log("Sending email to:", data.email); // Debug log
        console.log("OTP:", otp); // Debug log
        await this.sendVerificationEmail(data.email, otp);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      return {
        success: true,
        message: "Registration successful. Please verify your email.",
        role: user.role,
        userId: user._id,
        email: user.email
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  verifyOTP = async (email, otp) => {
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
  };

  resendOTP = async (email) => {
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
  };

  sendVerificationEmail = async (email, otp) => {
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL 
    console.log("Sending email to:", email);
    console.log("OTP:", otp); // Debug log
    console.log("From email:", FROM_EMAIL); 
    
    const msg = {
      to: email,
      from: {
      email: FROM_EMAIL,
      name: 'Tutoring Platform', // Optional: Adds a sender name
    },
      subject: 'Your Email Verification Code',
      text: `Your verification code is: ${otp}`,
      html: `<strong>Your verification code is: ${otp}</strong>`,
    };
    await sgMail.send(msg);
  };

  login = async (email, password) => {
    let user;
    for (const model of Object.values(ROLE_MODELS)) {
      user = await model.findOne({ email });
      if (user) break;
    }

    if (!user) throw new Error("Invalid email or password");
    // if (!user.emailVerified) throw new Error("Please verify your email first");

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
  };

  async sendPasswordResetOTP(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Using SendGrid format
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    console.log("Sending password reset email to:", email);
    console.log("OTP:", otp);
    console.log("From email:", FROM_EMAIL);

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: "Tutoring Platform", // Optional: Adds a sender name
      },
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Your password reset OTP is:</p>
          <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; 
                     font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      return { message: "OTP sent successfully" };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error("Failed to send password reset email");
    }
  }

  async verifyResetOTP(email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (
      user.resetPasswordOTP !== otp || 
      user.resetPasswordOTPExpiry < new Date()
    ) {
      throw new Error("Invalid or expired OTP");
    }

    user.isResetOTPVerified = true;
    await user.save();

    return { message: "OTP verified successfully" };
  }

  async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.resetPasswordOTP !== otp || !user.isResetOTPVerified) {
      throw new Error("Invalid OTP or verification");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    user.isResetOTPVerified = undefined;
    await user.save();

    return { message: "Password reset successfully" };
  }
}

// Export a new instance
export default new AuthService();