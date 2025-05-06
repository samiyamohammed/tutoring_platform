import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import generateToken from '../../infrastructure/config/jwtConfig.js';
import Student from "../../domain/models/Student.js"; // Adjust the path as necessary
import Tutor from "../../domain/models/Tutor.js"; // Adjust the path as necessary
import Admin from "../../domain/models/Admin.js"; // Adjust the path as necessary

class AuthService {
    async registerStudent(data) {
        data.password = await bcrypt.hash(data.password, 10);
        try {
            return await Student.create(data);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                throw new Error("Validation Error: " + error.message);
            } else if (error.code === 11000) { // Duplicate key error
                throw new Error("Email already exists");
            }
            throw error; 
        }
    }
    
    async registerTutor(data) {
        data.password = await bcrypt.hash(data.password, 10);
        try {
            return await Tutor.create(data);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                throw new Error("Validation Error: " + error.message);
            } else if (error.code === 11000) { // Duplicate key error
                throw new Error("Email already exists");
            }
            throw error; 
        }
    }
    
    async registerAdmin(data) {
        data.password = await bcrypt.hash(data.password, 10);
        try {
            return await Admin.create(data);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                throw new Error("Validation Error: " + error.message);
            } else if (error.code === 11000) { // Duplicate key error
                throw new Error("Email already exists");
            }
            throw error; 
        }
    }

  async login(email, password) {
    let user;

    // Try to find the user in all roles (student, tutor, admin)
    user = await Student.findOne({ email });
    if (!user) user = await Tutor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    // if (user.role === 'tutor' && user.verification_status === 'pending') {
    //     throw new Error("Account is being verified");    }
   
    const token = await generateToken(user);
    return { token, user };
  }
}

export default new AuthService();