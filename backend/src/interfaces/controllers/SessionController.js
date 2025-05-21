// src/interfaces/controllers/SessionController.js
import SessionService from '../../application/services/SessionService.js';

class SessionController {
  async create(req, res) {
    try {
      const sessionData = req.body;
      const session = await SessionService.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const sessions = await SessionService.getAllSessions();
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const session = await SessionService.getSessionById(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const sessionData = req.body;
      const session = await SessionService.updateSession(id, sessionData);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const session = await SessionService.deleteSession(id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SessionController();
