import * as quizRepository from '../../infrastructure/repositories/QuizRepository.js';

export const createQuiz = async (data) => await quizRepository.createQuiz(data);

export const getAllQuizzes = async () => await quizRepository.getAllQuizzes();

export const getQuizById = async (id) => await quizRepository.getQuizById(id);

export const findByCourse = async (courseId) => await quizRepository.getQuizzesByCourse(courseId);

export const updateQuiz = async (id, data) => await quizRepository.updateQuiz(id, data);

export const deleteQuiz = async (id) => await quizRepository.deleteQuiz(id);
