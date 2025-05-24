import Enrollment from '../../domain/models/Enrollment.js';

class EnrollmentRepository {
    async create(enrollmentData) {
        return await Enrollment.create(enrollmentData);
    }

    async findAll() {
        return await Enrollment.find().populate('course student');
    }

    async findById(id) {
        return await Enrollment.findById(id).populate('course student');
    }

    async findByStudentId(studentId) {
        return await Enrollment.find({ student: studentId }).populate('course');
    }

    async findByStudentAndCourseId(studentId, courseId) {
        return await Enrollment.findOne({ student: studentId, course: courseId }).populate('course student');
    }

    async update(id, updateData) {
        return await Enrollment.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Enrollment.findByIdAndDelete(id);
    }
}

export default new EnrollmentRepository();
