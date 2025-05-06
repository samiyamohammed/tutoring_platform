import * as quizService from '../../application/services/QuizService.js';

export const createQuiz = async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const courseId = req.query.course;

        let quizzes;
        if (courseId) {
            quizzes = await quizService.findByCourse(courseId);
        } else {
            quizzes = await quizService.findAll();
        }

        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getQuizById = async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await quizService.updateQuiz(req.params.id, req.body);
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await quizService.deleteQuiz(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
