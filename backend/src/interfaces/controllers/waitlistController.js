import { Request, Response } from "express";
import waitingListService from "./waitingList.service";

class WaitingListController {
  async joinWaitlist(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user._id; // Assuming you have user in request from auth middleware
      const result = await waitingListService.joinWaitlist(userId, courseId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async leaveWaitlist(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user._id;
      await waitingListService.leaveWaitlist(userId, courseId);
      res.status(200).json({ message: "Removed from waitlist" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getWaitlistStatus(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user._id;
      const status = await waitingListService.getWaitlistStatus(
        userId,
        courseId
      );
      res.status(200).json(status);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCourseWaitlist(req, res) {
    try {
      const { courseId } = req.params;
      const waitlist = await waitingListService.getCourseWaitlist(courseId);
      res.status(200).json(waitlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUserWaitlist(req, res) {
    try {
      const userId = req.user._id;
      const waitlist = await waitingListService.getUserWaitlist(userId);
      res.status(200).json(waitlist);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new WaitingListController();
