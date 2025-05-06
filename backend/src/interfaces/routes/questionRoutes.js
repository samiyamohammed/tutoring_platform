import { Router } from 'express';
import * as questionController from '../controllers/QuestionController.js';

const router = Router();

router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default router;
