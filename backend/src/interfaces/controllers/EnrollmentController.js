import EnrollmentService from '../../application/services/EnrollmentService.js';
import Enrollment from "../../domain/models/Enrollment.js";
import Course from "../../domain/models/Course.js";
import mongoose from 'mongoose';

class EnrollmentController {
  async enrollStudent(req, res) {
    try {
      req.body.student = req.user._id;
      const enrollment = await EnrollmentService.enrollStudent(req.body);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentService.getAllEnrollments();
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentService.getEnrollments(req.user._id);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCurrentEnrollment(req, res) {
    try {
      const enrollment = await EnrollmentService.getCurrentEnrollment(
        req.user._id,
        req.params.courseId
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEnrollment(req, res) {
    try {
      const enrollment = await EnrollmentService.updateEnrollment(
        req.params.id,
        req.body
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEnrollmentStatus(req, res) {
    try {
      const enrollment = await EnrollmentService.updateEnrollmentStatus(
        req.body.enrollmentId,
        req.body.status
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Removed `addProgress` unless you define it in the service.
  // async addProgress(req, res) {
  //   try {
  //     const progress = await EnrollmentService.addProgress(
  //       req.body.enrollmentId,
  //       req.body.moduleId,
  //       req.body.score
  //     );
  //     res.status(200).json(progress);
  //   } catch (error) {
  //     res.status(400).json({ message: error.message });
  //   }
  // }

  async updateProgress (req, res) {
    const { moduleId, sectionId, timeSpent = 1 } = req.body;
    
    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      student: req.user._id
    }).populate('course', 'modules');
  
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
  
    // Find the module and section in the course
    const course = enrollment.course;
    const module = course.modules.find(m => m._id.toString() === moduleId);
    if (!module) {
      throw new NotFoundError('Module not found in course');
    }
  
    const section = module.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      throw new NotFoundError('Section not found in module');
    }
  
    // Update module progress
    let moduleProgress = enrollment.progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProgress) {
      moduleProgress = {
        moduleId,
        status: 'started',
        startedAt: new Date(),
        timeSpent: 0,
        sections: []
      };
      enrollment.progress.modules.push(moduleProgress);
    }
  
    // Update section progress
    let sectionProgress = moduleProgress.sections.find(s => s.sectionId === sectionId);
    if (!sectionProgress) {
      sectionProgress = {
        sectionId,
        status: 'in_progress',
        startedAt: new Date(),
        timeSpent: 0
      };
      moduleProgress.sections.push(sectionProgress);
    }
  
    // Update timestamps and time spent
    sectionProgress.lastAccessed = new Date();
    sectionProgress.timeSpent += timeSpent;
    moduleProgress.lastAccessed = new Date();
    moduleProgress.timeSpent += timeSpent;
    enrollment.progress.lastActivity = new Date();
    enrollment.progress.timeSpentTotal += timeSpent;
    enrollment.progress.currentModule = moduleId;
    enrollment.progress.currentSection = sectionId;
  
    // Update module status if needed
    if (moduleProgress.status === 'not_started') {
      moduleProgress.status = 'started';
    }
  
    // Update enrollment status if needed
    if (enrollment.currentStatus === 'enrolled') {
      enrollment.currentStatus = 'in_progress';
    }
  
    // Calculate completion percentage
    const totalSections = course.modules.reduce((acc, mod) => acc + mod.sections.length, 0);
    const completedSections = enrollment.progress.modules.reduce((acc, mod) => {
      return acc + mod.sections.filter(s => s.status === 'completed').length;
    }, 0);
    
    enrollment.progress.completionPercentage = Math.round((completedSections / totalSections) * 100);
  
    // Check if course is completed
    if (enrollment.progress.completionPercentage === 100) {
      enrollment.currentStatus = 'completed';
      enrollment.certification = {
        eligible: true,
        issued: false
      };
    }
  
    await enrollment.save();
    res.json(enrollment);
  };
  
  // Mark a section as complete
  async markSectionComplete (req, res)  {
    const { moduleId, sectionId, notes } = req.body;
    
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      student: req.user._id
    }).populate('course', 'modules');
  
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
  
    // Find the module progress
    const moduleProgress = enrollment.progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProgress) {
      throw new NotFoundError('Module progress not found');
    }
  
    // Find the section progress
    const sectionProgress = moduleProgress.sections.find(s => s.sectionId === sectionId);
    if (!sectionProgress) {
      throw new NotFoundError('Section progress not found');
    }
  
    // Update section status
    sectionProgress.status = 'completed';
    sectionProgress.completedAt = new Date();
  
    // Add note if provided
    if (notes) {
      sectionProgress.notes = sectionProgress.notes || [];
      sectionProgress.notes.push({
        content: notes,
        createdAt: new Date()
      });
    }
  
    // Check if module is now completed
    const allSectionsCompleted = moduleProgress.sections.every(s => s.status === 'completed');
    if (allSectionsCompleted) {
      moduleProgress.status = 'completed';
      moduleProgress.completedAt = new Date();
    }
  
    // Calculate new completion percentage
    const course = enrollment.course;
    const totalSections = course.modules.reduce((acc, mod) => acc + mod.sections.length, 0);
    const completedSections = enrollment.progress.modules.reduce((acc, mod) => {
      return acc + mod.sections.filter(s => s.status === 'completed').length;
    }, 0);
    
    enrollment.progress.completionPercentage = Math.round((completedSections / totalSections) * 100);
  
    // Check if course is completed
    if (enrollment.progress.completionPercentage === 100) {
      enrollment.currentStatus = 'completed';
      enrollment.certification = {
        eligible: true,
        issued: false
      };
    }
  
    await enrollment.save();
    res.json(enrollment);
  };
  
  // Add a note to a section
  async addNoteToSection (req, res) {
    const { moduleId, sectionId, note } = req.body;
    
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      student: req.user._id
    });
  
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
  
    // Find the module progress
    const moduleProgress = enrollment.progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProgress) {
      throw new NotFoundError('Module progress not found');
    }
  
    // Find the section progress
    const sectionProgress = moduleProgress.sections.find(s => s.sectionId === sectionId);
    if (!sectionProgress) {
      throw new NotFoundError('Section progress not found');
    }
  
    // Add the note
    sectionProgress.notes = sectionProgress.notes || [];
    sectionProgress.notes.push({
      content: note,
      createdAt: new Date()
    });
  
    await enrollment.save();
    res.json(enrollment);
  };
  
  // Submit a quiz
  async submitQuiz (req, res) {
    const { moduleId, sectionId, quizId, answers } = req.body;
    
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      student: req.user._id
    }).populate({
      path: 'course',
      populate: {
        path: 'modules.sections.quiz'
      }
    });
  
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
  
    // Find the course, module, section and quiz
    const course = enrollment.course;
    const module = course.modules.find(m => m._id.toString() === moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }
  
    const section = module.sections.find(s => s._id.toString() === sectionId);
    if (!section || section.type !== 'quiz') {
      throw new NotFoundError('Quiz section not found');
    }
  
    if (!section.quiz || section.quiz._id.toString() !== quizId) {
      throw new NotFoundError('Quiz not found in section');
    }
  
    const quiz = section.quiz;
  
    // Calculate score
    let correctAnswers = 0;
    const questionResults = quiz.questions.map((question, qIndex) => {
      const userAnswers = answers[qIndex] || [];
      const isCorrect = arraysEqual(userAnswers.sort(), question.correctAnswers.sort());
      if (isCorrect) correctAnswers++;
      return {
        questionIndex: qIndex,
        userAnswers,
        correctAnswers: question.correctAnswers,
        isCorrect
      };
    });
  
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passingScore = 70; // Could be configurable per quiz
    const passed = score >= passingScore;
  
    // Find or create assessment progress
    let assessmentProgress = enrollment.progress.assessments.find(
      a => a.sectionId === sectionId && a.assessmentType === 'quiz'
    );
  
    if (!assessmentProgress) {
      assessmentProgress = {
        assessmentId: quizId,
        assessmentType: 'quiz',
        sectionId,
        attempts: [],
        required: true
      };
      enrollment.progress.assessments.push(assessmentProgress);
    }
  
    // Add attempt
    const attemptNumber = assessmentProgress.attempts.length + 1;
    assessmentProgress.attempts.push({
      attemptNumber,
      startedAt: new Date(),
      submittedAt: new Date(),
      score,
      passingScore,
      passed,
      answers: questionResults
    });
  
    // Update best score and passed status
    assessmentProgress.bestScore = Math.max(
      assessmentProgress.bestScore || 0,
      score
    );
    assessmentProgress.passed = assessmentProgress.passed || passed;
  
    // Update section progress
    const moduleProgress = enrollment.progress.modules.find(m => m.moduleId === moduleId);
    if (!moduleProgress) {
      throw new NotFoundError('Module progress not found');
    }
  
    let sectionProgress = moduleProgress.sections.find(s => s.sectionId === sectionId);
    if (!sectionProgress) {
      sectionProgress = {
        sectionId,
        status: passed ? 'completed' : 'in_progress',
        startedAt: new Date(),
        timeSpent: 0
      };
      moduleProgress.sections.push(sectionProgress);
    }
  
    if (passed) {
      sectionProgress.status = 'completed';
      sectionProgress.completedAt = new Date();
    }
  
    // Calculate new completion percentage
    const totalSections = course.modules.reduce((acc, mod) => acc + mod.sections.length, 0);
    const completedSections = enrollment.progress.modules.reduce((acc, mod) => {
      return acc + mod.sections.filter(s => s.status === 'completed').length;
    }, 0);
    
    enrollment.progress.completionPercentage = Math.round((completedSections / totalSections) * 100);
  
    await enrollment.save();
    res.json(enrollment);
  };
  
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default new EnrollmentController();
