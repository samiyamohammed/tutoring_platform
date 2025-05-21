import UserService from "../../application/services/UserService.js";

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


 async changePassword(req, res) {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: "Current password and new password are required" 
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ 
          message: "New password must be different from current password" 
        });
      }

      // Get user with password field
      const user = await UserService.getUserWithPassword(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          message: "Current password is incorrect" 
        });
      }

      // Hash new password and update
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const updatedUser = await UserService.updateUser(userId, { 
        password: hashedPassword 
      });

      res.status(200).json({ 
        message: "Password updated successfully",
        user: updatedUser 
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Middleware to prevent frequent password changes
  async passwordChangeLimiter(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id);
      if (user.updatedAt && Date.now() - user.updatedAt.getTime() < 24 * 60 * 60 * 1000) {
        return res.status(429).json({
          message: "You can only change your password once per day"
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
