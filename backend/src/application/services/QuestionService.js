import * as questionRepository from '../../infrastructure/repositories/QuestionRepository.js';

export const createQuestion = async (data) => await questionRepository.createQuestion(data);

export const getAllQuestions = async () => await questionRepository.getAllQuestions();

export const getQuestionById = async (id) => await questionRepository.getQuestionById(id);

export const updateQuestion = async (id, data) => await questionRepository.updateQuestion(id, data);

export const deleteQuestion = async (id) => await questionRepository.deleteQuestion(id);
