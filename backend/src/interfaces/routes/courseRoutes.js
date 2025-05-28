import express from "express";
import courseController from "../controllers/CourseController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import moduleRoutes from "./moduleRoutes.js";
import { upload, gfs } from "../../utils/multer-config.js";
import mongoose from "mongoose";

const router = express.Router();

// Course routes
router.get("/", courseController.getCourses);
router.get("/tutor", courseController.getTutorCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", courseController.create);

// Updated module creation with proper file handling
router.post(
  "/:courseId/modules",
  authenticate,
  upload.array("files"), // uses memoryStorage, so file.buffer is available
  async (req, res, next) => {
    try {
      req.fileIds = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const uploadStream = gfs.openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: {
              uploadedBy: req.user?._id || null,
              courseId: req.params.courseId, // Optional: Store related info
            },
          });

          // Push the uploaded file's ID to req.fileIds
          const fileId = await new Promise((resolve, reject) => {
            uploadStream.end(file.buffer); // this triggers 'finish'
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
          });

          req.fileIds.push(fileId);
        }
      }

      next(); // Pass fileIds to your controller
    } catch (err) {
      console.error("File processing error:", err);
      res.status(500).json({ error: "File upload failed" });
    }
  },
  courseController.addModule
);

// Other routes remain the same
router.get("/:courseId/modules", courseController.getModules);
router.get("/:courseId/modules/:moduleId", courseController.getModuleById);
router.put(
  "/:courseId/modules/:moduleId",
  upload.any(),
  async (req, res, next) => {
    try {
      if (req.files) {
        req.fileIds = [];
        for (const file of req.files) {
          const filename = file.filename;
          const uploadStream = gfs.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: req.user ? { uploadedBy: req.user._id } : null,
          });

          const fileId = await new Promise((resolve, reject) => {
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
            uploadStream.end(file.buffer);
          });

          req.fileIds.push(fileId);
        }
      }
      next();
    } catch (err) {
      console.error("File processing error:", err);
      return res.status(500).json({ error: "File processing failed" });
    }
  },
  courseController.updateModule
);

router.delete("/:courseId/modules/:moduleId", courseController.deleteModule);
router.delete("/:id", courseController.delete);

router.post("/:courseId/final-exam", courseController.createFinalExam);

// Get final exam of a course
router.get("/:courseId/final-exam", courseController.getFinalExam);

// Update final exam
router.put("/:courseId/final-exam", courseController.updateFinalExam);

// Delete final exam
router.delete("/:courseId/final-exam", courseController.deleteFinalExam);
router.put("/:id", authorize(["admin", "tutor"]), courseController.update);

// Assessment Routes
router.post("/:courseId/assessment", courseController.createAssessment);
router.get("/:courseId/assessment", courseController.getAssessment);
router.put("/:courseId/assessment", courseController.updateAssessment);
router.delete("/:courseId/assessment", courseController.deleteAssessment);

router.use("/module", moduleRoutes);

export default router;
