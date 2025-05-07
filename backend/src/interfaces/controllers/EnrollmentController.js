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

  async updateProgress(req, res) {
    const { moduleId, sectionId, timeSpent = 1 } = req.body;
    
    try {
      // First update the time spent and activity
      const enrollment = await Enrollment.findOneAndUpdate(
        {
          _id: req.params.enrollmentId,
          student: req.user._id
        },
        {
          $inc: {
            'progress.timeSpentTotal': timeSpent,
            'progress.modules.$[module].timeSpent': timeSpent,
            'progress.modules.$[module].sections.$[section].timeSpent': timeSpent
          },
          $set: {
            'progress.lastActivity': new Date(),
            'progress.currentModule': moduleId,
            'progress.currentSection': sectionId,
            'progress.modules.$[module].lastAccessed': new Date(),
            'progress.modules.$[module].sections.$[section].lastAccessed': new Date()
          }
        },
        {
          new: true,
          arrayFilters: [
            { 'module.moduleId': moduleId },
            { 'section.sectionId': sectionId }
          ]
        }
      ).populate('course', 'modules');
  
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
  
      // Recalculate completion percentage properly
      const course = enrollment.course;
      let totalSections = 0;
      let completedSections = 0;
  
      course.modules.forEach(module => {
        totalSections += module.sections.length;
        const moduleProgress = enrollment.progress.modules.find(m => m.moduleId === module._id.toString());
        if (moduleProgress) {
          completedSections += moduleProgress.sections.filter(s => s.status === 'completed').length;
        }
      });
  
      const completionPercentage = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100)
        : 0;
  
      // Update completion status if changed
      if (enrollment.progress.completionPercentage !== completionPercentage) {
        enrollment.progress.completionPercentage = completionPercentage;
        
        // Mark course as completed if all sections are done
        if (completionPercentage === 100) {
          enrollment.currentStatus = 'completed';
          enrollment.certification = enrollment.certification || {};
          enrollment.certification.eligible = true;
        }
  
        await enrollment.save();
      }
  
      res.json(enrollment);
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  }
  
  // Mark a section as complete
  async markSectionComplete(req, res) {
    try {
      const { moduleId, sectionId, notes } = req.body;
      
      // First mark the section as complete
      const enrollment = await Enrollment.findOneAndUpdate(
        {
          _id: req.params.enrollmentId,
          student: req.user._id,
          'progress.modules.sections.sectionId': sectionId
        },
        {
          $set: {
            'progress.modules.$[].sections.$[section].status': 'completed',
            'progress.modules.$[].sections.$[section].completedAt': new Date(),
            'progress.lastActivity': new Date(),
            ...(notes ? {
              'progress.modules.$[].sections.$[section].notes': {
                content: notes,
                createdAt: new Date()
              }
            } : {})
          }
        },
        {
          new: true,
          arrayFilters: [
            { 'section.sectionId': sectionId }
          ]
        }
      ).populate('course', 'modules');
  
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
  
      // Recalculate completion percentage
      const course = enrollment.course;
      let totalSections = 0;
      let completedSections = 0;
  
      course.modules.forEach(module => {
        totalSections += module.sections.length;
        const moduleProgress = enrollment.progress.modules.find(m => m.moduleId === module._id.toString());
        if (moduleProgress) {
          completedSections += moduleProgress.sections.filter(s => s.status === 'completed').length;
        }
      });
  
      const completionPercentage = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100)
        : 0;
  
      // Update completion status
      enrollment.progress.completionPercentage = completionPercentage;
      
      if (completionPercentage === 100) {
        enrollment.currentStatus = 'completed';
        enrollment.certification = enrollment.certification || {};
        enrollment.certification.eligible = true;
      }
  
      await enrollment.save();
      res.json(enrollment);
    } catch (error) {
      console.error("Error marking section complete:", error);
      res.status(500).json({ message: error.message });
    }
  }
  
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
