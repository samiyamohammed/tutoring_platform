import UserService from "../../application/services/UserService.js";
import User from "../../domain/models/User.js";


class UserController {
  // Get user profile (accessible by all users)
  async getProfile(req, res) {
    const userId = req.user.id; // Get the ID from the token (attached by authMiddleware)
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update user profile (accessible by all users)
  async updateProfile(req, res) {
    const userId = req.user.id; // Get the ID from the token (attached by authMiddleware)
    const updateData = req.body;
    try {
      const updatedUser = await UserService.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    const userId = req.params.id;
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllStudents(req, res) {
    try {
      const students = await UserService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all tutors (admin only)
  async getAllTutors(req, res) {
    try {
      const tutors = await UserService.getAllTutors();
      res.status(200).json(tutors);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all admins (admin only)
  async getAllAdmins(req, res) {
    try {
      const admins = await UserService.getAllAdmins();
      res.status(200).json(admins);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update any user (admin only)
  async updateUser(req, res) {
    const userId = req.params.id;
    const updateData = req.body;
    console.log("Update Data:", updateData);
  
    try {
      // Fetch the tutor before updating
      const tutor = await User.findById(userId);

      if (!tutor) {
        return res.status(404).json({ message: "User not found" });
      }

      // If files were uploaded, append them to verification_documents
      if (req.uploadedDocuments && req.uploadedDocuments.length > 0) {
        tutor.verification_documents.push(...req.uploadedDocuments);
      }

      // Apply the updateData directly to tutor
      Object.assign(tutor, updateData);

      // Save tutor with the updated information
      const updatedTutor = await tutor.save();

      return res.status(200).json(updatedTutor);
    } catch (error) {
      console.error('Update error:', error);
      res.status(400).json({ message: error.message });
    }
}

  

  // Delete a user (admin only)
  async deleteUser(req, res) {
    const userId = req.params.id;
    try {
      const deletedUser = await UserService.deleteUser(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new UserController();
