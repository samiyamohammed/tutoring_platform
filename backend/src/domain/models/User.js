import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "tutor", "admin"], default: "student" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
