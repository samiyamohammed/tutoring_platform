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

    async addRating(req, res) {
    const tutorId = req.params.tutorId;
    const student = req.user.id;
    const { rating, comment } = req.body;
    try {
      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const newRating = {
        student,
        rating,
        comment: comment || "",
        date: new Date()
      };

      const updatedTutor = await UserService.addTutorRating(tutorId, newRating);
      if (!updatedTutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      res.status(201).json(updatedTutor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all ratings for a tutor
  async getTutorRatings(req, res) {
    const tutorId = req.params.tutorId;

    try {
      const ratings = await UserService.getTutorRatings(tutorId);
      if (!ratings) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      res.status(200).json(ratings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get a specific rating
  async getRating(req, res) {
    const { tutorId, ratingId } = req.params;

    try {
      const rating = await UserService.getTutorRating(tutorId, ratingId);
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.status(200).json(rating);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update a rating (only by the student who created it)
  async updateRating(req, res) {
    const { tutorId, ratingId } = req.params;
    const student = req.user.id;
    const { rating, comment } = req.body;

    try {
      // First check if the rating exists and belongs to the student
      const tutor = await User.findById(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const ratingToUpdate = tutor.ratings.id(ratingId);
      if (!ratingToUpdate) {
        return res.status(404).json({ message: "Rating not found" });
      }

      if (ratingToUpdate.student.toString() !== student) {
        return res.status(403).json({ message: "You can only update your own ratings" });
      }

      // Validate new rating if provided
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const updatedTutor = await UserService.updateTutorRating(
        tutorId,
        ratingId,
        { student, rating, comment }
      );

      res.status(200).json(updatedTutor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a rating (only by the student who created it or admin)
  async deleteRating(req, res) {
    const { tutorId, ratingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      // First check if the rating exists and belongs to the student or user is admin
      const tutor = await Tutor.findById(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const ratingToDelete = tutor.ratings.id(ratingId);
      if (!ratingToDelete) {
        return res.status(404).json({ message: "Rating not found" });
      }

      if (ratingToDelete.student.toString() !== userId && userRole !== 'admin') {
        return res.status(403).json({ 
          message: "You can only delete your own ratings unless you're an admin"
        });
      }

      const updatedTutor = await UserService.deleteTutorRating(tutorId, ratingId);
      res.status(200).json(updatedTutor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new UserController();