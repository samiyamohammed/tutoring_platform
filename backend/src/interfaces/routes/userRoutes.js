import express from "express";
import userController from "../controllers/UserController.js"; // Import the instance directly
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { upload, gfs } from "../../utils/multer-config.js";

const router = express.Router();

// Profile management routes (for all user types)
router.get("/profile", (req, res) => userController.getProfile(req, res));
router.put("/profile", (req, res) => userController.updateProfile(req, res));
router.get("/tutors", (req, res) => userController.getAllTutors(req, res));
router.delete("/:id", (req, res) => userController.deleteUser(req, res));

// Rating routes
router.post("/tutors/:tutorId/ratings", (req, res) =>
  userController.addRating(req, res)
);
router.get("/tutors/:tutorId/ratings", (req, res) =>
  userController.getTutorRatings(req, res)
);
router.get("/tutors/:tutorId/ratings/:ratingId", (req, res) =>
  userController.getRating(req, res)
);
router.put("/tutors/:tutorId/ratings/:ratingId", (req, res) =>
  userController.updateRating(req, res)
);
router.delete("/tutors/:tutorId/ratings/:ratingId", (req, res) =>
  userController.deleteRating(req, res)
);

// User management routes (admin only)
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.get("/tutors", authorize(["admin"]), (req, res) =>
  userController.getAllTutors(req, res)
);
router.get("/students", authorize(["admin"]), (req, res) =>
  userController.getAllStudents(req, res)
);
router.get("/Admin", authorize(["admin"]), (req, res) =>
  userController.getAllStudents(req, res)
);
router.get("/", (req, res) => userController.getAllUsers(req, res));
router.put(
  "/:id",
  upload.array("files"),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      req.uploadedDocuments = [];

      const fileDocumentNames = req.body.fileDocumentNames;
      const parsedNames = Array.isArray(fileDocumentNames)
        ? fileDocumentNames
        : [fileDocumentNames]; // Handle single upload case

      for (let i = 0; i < req.files.length; i++) {
        const currentFile = req.files[i];
        const documentName = parsedNames[i] || currentFile.originalname; // fallback if missing

        const fileId = await new Promise((resolve, reject) => {
          const uniqueFilename = `${Date.now()}-${currentFile.originalname}`;
          const uploadStream = gfs.openUploadStream(uniqueFilename, {
            contentType: currentFile.mimetype,
            metadata: {
              uploadedBy: req.user?._id || null,
              tutorId: req.params.id,
              originalName: currentFile.originalname,
            },
          });

          uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
          uploadStream.on("error", reject);

          uploadStream.end(currentFile.buffer);
        });

        const fileUrl = `api/files/${fileId}`;

        req.uploadedDocuments.push({
          name: documentName, // 👈 Use the passed document name (type or description)
          url: fileUrl,
          fileId: fileId,
        });
      }

      next();
    } catch (err) {
      console.error("File upload error:", err);
      return res
        .status(500)
        .json({ message: "File upload error", error: err.message });
    }
  },
  (req, res) => userController.updateUser(req, res)
);

export default router;
