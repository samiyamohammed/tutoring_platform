import Enrollment from '../../domain/models/Enrollment.js';
import Course from '../../domain/models/Course.js';
import mongoose from 'mongoose';
const { Types } = mongoose;

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

    async findByTutorId(tutorId) {
        try {
            // 1. First find all courses by this tutor
            const courses = await Course.find({ tutor: tutorId }).select('_id');
            console.log('Courses found for tutor:', courses);

            // 2. Then find enrollments for these courses
            const enrollments = await Enrollment.find({
                course: { $in: courses.map(c => c._id) }
            })
                .populate('student', 'name email')
                .populate({
                    path: 'course',
                    select: 'title tutor',
                    populate: {
                        path: 'tutor',
                        select: 'name email'
                    }
                });

            return enrollments;
        } catch (error) {
            console.error('Error finding enrollments by tutor:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        return await Enrollment.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Enrollment.findByIdAndDelete(id);
    }
}

export default new EnrollmentRepository();
