// src/application/services/SessionService.js
import SessionRepository from '../../infrastructure/repositories/SessionRepository.js';

class SessionService {
  async createSession(sessionData) {
    return await SessionRepository.create(sessionData);
  }

  async getAllSessions() {
    return await SessionRepository.findAll();
  }

  async getSessionById(id) {
    return await SessionRepository.findById(id);
  }

  async updateSession(id, sessionData) {
    return await SessionRepository.update(id, sessionData);
  }

  async deleteSession(id) {
    return await SessionRepository.delete(id);
  }
}

export default new SessionService();
