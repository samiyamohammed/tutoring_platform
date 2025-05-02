import VideoSession from '../../domain/models/VideoSession.js';
import User from '../../domain/models/User.js';

export const createVideoSession = async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can create video sessions' });
    }

    const session = new VideoSession({
      tutor: req.user._id,
      status: 'scheduled'
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteToVideoSession = async (req, res) => {
  try {
    const { sessionId, studentIds } = req.body;

    const session = await VideoSession.findOne({
      _id: sessionId,
      tutor: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // Add students to session (avoid duplicates)
    const uniqueStudentIds = [...new Set([...session.students, ...studentIds])];
    session.students = uniqueStudentIds;
    await session.save();

    res.json({ message: 'Students invited successfully', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideoSession = async (req, res) => {
  try {
    const session = await VideoSession.findOne({
      _id: req.params.id,
      $or: [
        { tutor: req.user._id },
        { students: req.user._id }
      ]
    }).populate('tutor students');

    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyVideoSessionAccess = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can verify session access' });
    }

    const session = await VideoSession.findOne({
      _id: req.params.id,
      students: req.user._id,
      status: { $in: ['scheduled', 'active'] }
    }).populate('tutor');

    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // Update session status if it's the first access
    if (session.status === 'scheduled') {
      session.status = 'active';
      await session.save();
    }

    res.json({ valid: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTutorVideoSessions = async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can view their sessions' });
    }

    const sessions = await VideoSession.find({
      tutor: req.user._id,
      status: { $in: ['scheduled', 'active'] }
    }).populate('students');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentVideoSessions = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their sessions' });
    }

    const sessions = await VideoSession.find({
      students: req.user._id,
      status: { $in: ['scheduled', 'active'] }
    }).populate('tutor');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const endVideoSession = async (req, res) => {
  try {
    const session = await VideoSession.findOneAndUpdate(
      {
        _id: req.params.id,
        tutor: req.user._id,
        status: 'active'
      },
      { status: 'completed', endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Active session not found or unauthorized' });
    }

    res.json({ message: 'Session ended successfully', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};