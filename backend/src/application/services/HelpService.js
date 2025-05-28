import HelpRequest from "../../domain/models/HelpRequest.js";

export default class HelpService {
  static async createHelpRequest(requestData) {
    return await HelpRequest.create(requestData);
  }

  static async getAllRequests(status = "pending") {
    return await HelpRequest.find({ status }).sort({ createdAt: -1 }).lean();
  }

  static async updateRequestStatus(id, status, adminNotes = "") {
    return await HelpRequest.findByIdAndUpdate(
      id,
      { status, adminNotes, updatedAt: Date.now() },
      { new: true }
    );
  }

  static async deleteRequest(id) {
    return await HelpRequest.findByIdAndDelete(id);
  }

  static async addAdminNote(id, note) {
    return await HelpRequest.findByIdAndUpdate(
      id,
      { $push: { adminNotes: note }, updatedAt: Date.now() },
      { new: true }
    );
  }
}
