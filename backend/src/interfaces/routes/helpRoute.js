import express from "express";
import { body } from "express-validator";
import {
  createHelpRequest,
  getHelpRequests,
  updateHelpRequestStatus,
} from "../controllers/HelpController.js";

const router = express.Router();

const validateHelpRequest = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name too long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 20-2000 characters"),
];
const validateStatusUpdate = [
  body("status")
    .isIn(["pending", "closed", "resolved"])
    .withMessage(
      "Invalid status. Allowed values: pending, in_progress, resolved"
    ),
];

router.post("/", validateHelpRequest, createHelpRequest);
router.get("/", getHelpRequests);
router.put("/:id/status", validateStatusUpdate, updateHelpRequestStatus);


export default router;
