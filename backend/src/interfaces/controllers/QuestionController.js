import * as questionService from '../../application/services/QuestionService.js';

export const createQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const updated = await questionService.updateQuestion(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const deleted = await questionService.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
