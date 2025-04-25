// gfs.js
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import connectDB from '../infrastructure/database/db.js';

let gfs;
let gridFSBucket;
let gfsInitialized = false;

const initializeGridFS = async () => {
  try {
    await connectDB();
    
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    gfs = {
      bucket: gridFSBucket,
      async delete(fileId) {
        return gridFSBucket.delete(new mongoose.Types.ObjectId(fileId));
      },
      async find(query) {
        return gridFSBucket.find(query).toArray();
      },
      openDownloadStream: (fileId) => {
        return gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      }
    };
    
    console.log('GridFS initialized successfully');
    gfsInitialized = true;
  } catch (err) {
    console.error('GridFS initialization error:', err);
    throw err;
  }
};

// Initialize immediately
initializeGridFS().catch(err => {
  console.error('Failed to initialize GridFS:', err);
  process.exit(1);
});

export default gfs;