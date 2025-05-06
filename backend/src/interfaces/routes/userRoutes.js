import express from "express";
import userController from "../controllers/UserController.js"; // Import the instance directly
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Profile management routes (for all user types)
router.get("/profile", (req, res) => userController.getProfile(req, res));
router.put("/profile", (req, res) => userController.updateProfile(req, res));

// User management routes (admin only)
router.get("/tutors", authorize(["admin"]), (req, res) =>
  userController.getAllTutors(req, res)
);

router.get("/:id", authorize(["admin"]), (req, res) =>
  userController.getUserById(req, res)
);
router.get("/students", authorize(["admin"]), (req, res) =>
  userController.getAllStudents(req, res)
);
router.get("/Admin", authorize(["admin"]), (req, res) =>
  userController.getAllStudents(req, res)
);
router.get("/", authorize(["admin"]), (req, res) =>
  userController.getAllUsers(req, res)
);
router.put("/:id", authorize(["admin"]), (req, res) =>
  userController.updateUser(req, res)
);
router.delete("/:id", authorize(["admin"]), (req, res) =>
  userController.deleteUser(req, res)
);

router.put(
  "/change-password",
  authenticate,
  userController.passwordChangeLimiter,
  userController.changePassword
);

export default router;
