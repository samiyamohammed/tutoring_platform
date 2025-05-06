import EnrollmentRepository from '../../infrastructure/repositories/EnrollmentRepository.js';
import CourseRepository from '../../infrastructure/repositories/CourseRepository.js';
import UserRepository from '../../infrastructure/repositories/UserRepository.js';
import Enrollment from "../../domain/models/Enrollment.js";
import Course from "../../domain/models/Course.js";
import mongoose from 'mongoose';

class EnrollmentService {
  async enrollStudent(data) {
    const course = await CourseRepository.findById(data.course);
    const student = await UserRepository.findById(data.student);

    if (!course) throw new Error('Course not found');
    if (!student) throw new Error('Student not found');

    const existingEnrollment = await EnrollmentRepository.findByStudentId(student);
    if (existingEnrollment.some(enrollment => enrollment.course.toString() === course.id)) {
      throw new Error('Student is already enrolled in this course');
    }

    return await EnrollmentRepository.create(data);
  }

  async getEnrollments(studentId) {
    return await EnrollmentRepository.findByStudentId(studentId);
  }

  async getCurrentEnrollment(studentId, courseId) {
    const enrollment = await EnrollmentRepository.findByStudentAndCourseId(studentId, courseId);
    if (!enrollment) throw new Error('Enrollment not found');
    return enrollment;
  }

  async updateEnrollmentStatus(enrollmentId, status) {
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');

    enrollment.currentStatus = status;
    enrollment.statusHistory.push({ status, changedAt: new Date() });

    return await enrollment.save();
  }

  async getAllEnrollments() {
    return await EnrollmentRepository.findAll();
  }

  async updateProgress(enrollmentId, studentId, { moduleId, sectionId, timeSpent = 1 }) {
    const enrollment = await this._verifyEnrollmentOwnership(enrollmentId, studentId);
  
    const moduleProgress = this._getOrCreateModuleProgress(enrollment, moduleId);
    const sectionProgress = this._getOrCreateSectionProgress(moduleProgress, sectionId);
  
    sectionProgress.status = 'in_progress';
    sectionProgress.startedAt ??= new Date();
    sectionProgress.lastAccessed = new Date();
    sectionProgress.timeSpent += timeSpent;
  
    moduleProgress.status = 'started';
    moduleProgress.lastAccessed = new Date();
    moduleProgress.timeSpent += timeSpent;
  
    enrollment.progress.currentModule = moduleId;
    enrollment.progress.currentSection = sectionId;
    enrollment.progress.lastActivity = new Date();
    enrollment.progress.timeSpentTotal += timeSpent;
  
    return await enrollment.save();
  }
  
  async markSectionComplete(enrollmentId, studentId, { moduleId, sectionId }) {
    const enrollment = await this._verifyEnrollmentOwnership(enrollmentId, studentId);
  
    const moduleProgress = this._getModuleProgress(enrollment, moduleId);
    const sectionProgress = this._getSectionProgress(moduleProgress, sectionId);
  
    sectionProgress.status = 'completed';
    sectionProgress.completedAt = new Date();
  
    const allSectionsCompleted = moduleProgress.sections.every(s => s.status === 'completed');
    if (allSectionsCompleted) {
      moduleProgress.status = 'completed';
      moduleProgress.completedAt = new Date();
    }
  
    enrollment.progress.lastActivity = new Date();
  
    return await enrollment.save();
  }

  async _verifyEnrollmentOwnership(enrollmentId, studentId) {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');
    if (!enrollment.student.equals(studentId)) throw new Error('Not authorized');
    return enrollment;
  }

  _getOrCreateModuleProgress(enrollment, moduleId) {
    // const targetId = new mongoose.Types.ObjectId(moduleId);
let moduleProgress = enrollment.progress.modules.find(m =>
  new mongoose.Types.ObjectId(m.moduleId).equals(targetId)
);

  
    if (!moduleProgress) {
      moduleProgress = {
        moduleId: targetId,
        status: 'started',
        startedAt: new Date(),
        timeSpent: 0,
        sections: []
      };
      enrollment.progress.modules.push(moduleProgress);
    }
  
    return moduleProgress;
  }
  

  _getOrCreateSectionProgress(moduleProgress, sectionId) {
    let sectionProgress = moduleProgress.sections.find(s => s.sectionId.equals(sectionId));

    if (!sectionProgress) {
      sectionProgress = {
        sectionId,
        status: 'in_progress',
        startedAt: new Date(),
        timeSpent: 0
      };
      moduleProgress.sections.push(sectionProgress);
    }

    return sectionProgress;
  }

  _getModuleProgress(enrollment, moduleId) {
    const targetId = new mongoose.Types.ObjectId(moduleId);
const module = enrollment.progress.modules.find(m =>
  new mongoose.Types.ObjectId(m.moduleId).equals(targetId)
);

    if (!module) throw new Error(`Module progress not found for moduleId: ${moduleId}`);
    return module;
  }

  _getSectionProgress(moduleProgress, sectionId) {
    const section = moduleProgress.sections.find(s => s.sectionId.equals(sectionId));
    if (!section) throw new Error(`Section progress not found for sectionId: ${sectionId}`);
    return section;
  }
}

export default new EnrollmentService();