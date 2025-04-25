import express from 'express';
import courseController from "../controllers/CourseController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import moduleRoutes from "./moduleRoutes.js";
import { upload, gfs } from '../../utils/multer-config.js';
import mongoose from 'mongoose';

const router = express.Router();

// Course routes
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);

// Updated module creation with proper file handling
router.post('/:courseId/modules', 
  authenticate,
  upload.array('files'),
  async (req, res, next) => {
    try {
      // Process uploaded files and add to GridFS
      if (req.files) {
        req.fileIds = [];
        for (const file of req.files) {
          const filename = file.filename;
          const uploadStream = gfs.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: req.user ? { uploadedBy: req.user._id } : null
          });
          
          const fileId = await new Promise((resolve, reject) => {
            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.on('error', reject);
            uploadStream.end(file.buffer);
          });
          
          req.fileIds.push(fileId);
        }
      }
      next();
    } catch (err) {
      console.error('File processing error:', err);
      return res.status(500).json({ error: 'File processing failed' });
    }
  },
  courseController.addModule
);

// Other routes remain the same
router.get('/:courseId/modules', courseController.getModules);
router.get('/:courseId/modules/:moduleId', courseController.getModuleById);

router.put('/:courseId/modules/:moduleId',
  upload.any(),
  async (req, res, next) => {
    try {
      if (req.files) {
        req.fileIds = [];
        for (const file of req.files) {
          const filename = file.filename;
          const uploadStream = gfs.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: req.user ? { uploadedBy: req.user._id } : null
          });
          
          const fileId = await new Promise((resolve, reject) => {
            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.on('error', reject);
            uploadStream.end(file.buffer);
          });
          
          req.fileIds.push(fileId);
        }
      }
      next();
    } catch (err) {
      console.error('File processing error:', err);
      return res.status(500).json({ error: 'File processing failed' });
    }
  },
  courseController.updateModule
);

router.delete('/:courseId/modules/:moduleId', courseController.deleteModule);
router.put("/:id", authorize(['admin', 'tutor']), courseController.update);
router.delete("/:id", authorize(['admin', 'tutor']), courseController.delete);
router.post("/", authorize(['admin', 'tutor']), courseController.create);

// File download route
router.get('/files/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await gfs.find({ _id: fileId }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set('Content-Type', file[0].contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${file[0].filename}"`);
    
    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use("/module", moduleRoutes);

export default router;