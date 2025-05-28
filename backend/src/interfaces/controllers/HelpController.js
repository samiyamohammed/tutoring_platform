import HelpService from "../../application/services/HelpService.js";
import { validationResult } from "express-validator";

export const createHelpRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await HelpService.createHelpRequest(req.body);

    res.status(201).json({
      success: true,
      data: request,
      message: "Help request submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHelpRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const requests = await HelpService.getAllRequests(status);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  
};
export const updateHelpRequestStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const updatedRequest = await HelpRequest.findByIdAndUpdate(
        id,
        { status, updatedAt: Date.now() },
        { new: true }
      );
  
      if (!updatedRequest) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }
  
      res.json({ success: true, data: updatedRequest });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

