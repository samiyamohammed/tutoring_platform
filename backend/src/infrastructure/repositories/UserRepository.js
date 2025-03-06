import UserModel from "../../domain/models/User.js";

class UserRepository {
  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(userData) {
    return UserModel.create(userData);
  }
}

export default new UserRepository();
