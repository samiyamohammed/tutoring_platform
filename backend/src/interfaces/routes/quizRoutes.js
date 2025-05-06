import { Router } from 'express';
import * as quizController from '../controllers/QuizController.js';

const router = Router();

router.post('/', quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

export default router;
