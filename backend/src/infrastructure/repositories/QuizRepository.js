import Quiz from '../../domain/models/Quiz.js';

export const createQuiz = async (quizData) => await Quiz.create(quizData);

export const getAllQuizzes = async () => await Quiz.find().populate('course');

export const getQuizById = async (id) => await Quiz.findById(id).populate('course');

export const getQuizzesByCourse = async (courseId) => await Quiz.find({ course: courseId }); 

export const updateQuiz = async (id, data) => await Quiz.findByIdAndUpdate(id, data, { new: true });

export const deleteQuiz = async (id) => await Quiz.findByIdAndDelete(id);
