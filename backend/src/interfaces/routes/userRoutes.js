import express from "express";
import userController from "../controllers/UserController.js"; // Import the instance directly
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { upload, gfs } from '../../utils/multer-config.js';

const router = express.Router();

// Profile management routes (for all user types)
router.get("/profile",  (req, res) => userController.getProfile(req, res));
router.put("/profile",  (req, res) => userController.updateProfile(req, res));

// User management routes (admin only)
router.get("/:id", authorize(['admin']), (req, res) => userController.getUserById(req, res));
router.get("/tutors",authorize(['admin']), (req, res) => userController.getAllTutors(req, res));
router.get("/students",authorize(['admin']), (req, res) => userController.getAllStudents(req, res));
router.get("/Admin",authorize(['admin']), (req, res) => userController.getAllStudents(req, res));
router.get("/",authorize(['admin']), (req, res) => userController.getAllUsers(req, res));
router.put("/:id", upload.array('files'), async (req, res, next) => {
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
      const file = req.files[i];
      const documentName = parsedNames[i] || file.originalname; // fallback if missing

      const fileId = await new Promise((resolve, reject) => {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        const uploadStream = gfs.openUploadStream(uniqueFilename, {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: req.user?._id || null,
            tutorId: req.params.id,
            originalName: file.originalname
          }
        });

        uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
        uploadStream.on('error', reject);

        uploadStream.end(file.buffer);
      });

      const fileUrl = `api/files/${fileId}`;

      req.uploadedDocuments.push({
        name: documentName, // 👈 Use the passed document name (type or description)
        url: fileUrl,
        fileId: fileId
      });
    }

    next();
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ message: 'File upload error', error: err.message });
  }
}, (req, res) => userController.updateUser(req, res));


router.delete("/:id", authorize(['admin']), (req, res) => userController.deleteUser(req, res));

export default router;