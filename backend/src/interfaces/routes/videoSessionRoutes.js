import express from 'express';
import {
  createVideoSession,
  inviteToVideoSession,
  getVideoSession,
  verifyVideoSessionAccess,
  getTutorVideoSessions,
  getStudentVideoSessions,
  endVideoSession
} from '../controllers/videoSessionController.js';

const router = express.Router();

router.post('/', createVideoSession);
router.post('/invite', inviteToVideoSession);
router.get('/:id', getVideoSession);
router.get('/:id/verify', verifyVideoSessionAccess);
router.get('/tutor/upcoming', getTutorVideoSessions);
router.get('/student/upcoming', getStudentVideoSessions);
router.post('/:id/end', endVideoSession);

export default router;