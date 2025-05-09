import EnrollmentRepository from '../../infrastructure/repositories/EnrollmentRepository.js';
import CourseRepository from '../../infrastructure/repositories/CourseRepository.js';
import UserRepository from '../../infrastructure/repositories/UserRepository.js';  // Assuming user repository exists

class EnrollmentService {
    // Enroll student in a course
    async enrollStudent(data) {
        const course = await CourseRepository.findById(data.course);
        const student = await UserRepository.findById(data.student);

        if (!course) {
            throw new Error('Course not found');
        }

        if (!student) {
            throw new Error('Student not found');
        }

        // Check if student is already enrolled in the course
        const existingEnrollment = await EnrollmentRepository.findByStudentId(student);
        if (existingEnrollment.some(enrollment => enrollment.course.toString() === course)) {
            throw new Error('Student is already enrolled in this course');
        }

        const enrollmentData = data;

        return await EnrollmentRepository.create(enrollmentData);
    }

    // Get all enrollments for a student
    async getEnrollments(studentId) {
        return await EnrollmentRepository.findByStudentId(studentId);
    }

    // Update enrollment status (in_progress, completed, etc.)
    async updateEnrollmentStatus(enrollmentId, status) {
        const enrollment = await EnrollmentRepository.findById(enrollmentId);
        if (!enrollment) {
            throw new Error('Enrollment not found');
        }
        enrollment.enrollmentStatus.push({ status });
        return await EnrollmentRepository.update(enrollmentId, { enrollmentStatus: enrollment.enrollmentStatus });
    }

    // Add progress (e.g., module completion, quiz scores)
    async addProgress(enrollmentId, moduleId, score) {
        const enrollment = await EnrollmentRepository.findById(enrollmentId);
        if (!enrollment) {
            throw new Error('Enrollment not found');
        }
        enrollment.progress.completedModules.push({ module: moduleId, score });
        return await EnrollmentRepository.update(enrollmentId, { progress: enrollment.progress });
    }
}

export default new EnrollmentService();
