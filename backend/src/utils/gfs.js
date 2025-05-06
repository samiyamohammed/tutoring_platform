import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import connectDB from "../infrastructure/database/db.js";

let gfs;

const initializeGridFS = async () => {
  await connectDB(); // Ensure the database is connected

  const conn = mongoose.connection; // Get the connection instance
  conn.once("open", () => {
    gfs = new GridFSBucket(conn.db, {
      bucketName: "uploads", // Change this if you are using a different bucket name
    });
  });
};

initializeGridFS();

export default gfs;
