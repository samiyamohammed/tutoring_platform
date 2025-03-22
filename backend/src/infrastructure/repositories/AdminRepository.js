import Admin from "../../domain/models/Admin.js";

class AdminRepository {
  async createAdmin(data) {
    const admin = new Admin(data);
    return await admin.save();
  }
}

export default new AdminRepository();
