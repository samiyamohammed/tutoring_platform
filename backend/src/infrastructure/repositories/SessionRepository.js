// src/infrastructure/repositories/SessionRepository.js
import SessionRequest from "../../domain/models/Session.js";

class SessionRepository {
  async create(sessionData) {
    return await SessionRequest.create(sessionData);
  }

  async findAll() {
    return await SessionRequest.find().populate("student tutor course");
  }

  async findById(id) {
    return await SessionRequest.findById(id).populate("student tutor course");
  }

  async findByUserId(userId) {
    return await SessionRequest.find({ tutor: userId }).populate(
      "student tutor course"
    );
  }

  async update(id, sessionData) {
    return await SessionRequest.findByIdAndUpdate(id, sessionData, {
      new: true,
    });
  }

  async delete(id) {
    return await SessionRequest.findByIdAndDelete(id);
  }
}

export default new SessionRepository();
