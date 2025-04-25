import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

// Use memory storage to access file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Set up GridFSBucket when the DB connection is open
let gfs;
const conn = mongoose.connection;

conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: 'uploads',
    chunkSizeBytes: 1024 * 1024 * 4 // 4MB chunks (better for videos)
  });
  console.log('GridFSBucket initialized');
});

export { upload, gfs };