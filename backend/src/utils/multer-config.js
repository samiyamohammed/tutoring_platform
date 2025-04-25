import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';

// Initialize GridFS bucket
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});

// Custom storage engine that avoids BSON version conflicts
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      const filename = buf.toString('hex') + path.extname(file.originalname);
      cb(null, filename);
    });
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export { upload, gfs };