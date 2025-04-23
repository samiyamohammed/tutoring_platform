import CourseRepository from '../../infrastructure/repositories/CourseRepository.js';

class CourseService {
    async createCourse(courseData) {
        return await CourseRepository.create(courseData);
    }

    async getCourses() {
        return await CourseRepository.findAll();
    }

    async getCourseById(id) {
        return await CourseRepository.findById(id);
    }

    async updateCourse(id, userId, updateData) {
        const course = await CourseRepository.findById(id);
        console.log('Course Tutor ID:', course.tutor._id.toString());
        console.log('User ID:', userId);
        if (!course || course.tutor._id.toString() !== userId.toString()) {
            throw new Error('Unauthorized: You are not the tutor of this course');
        }
        return await CourseRepository.update(id, updateData);
    }

    async deleteCourse(id, userId) {
        const course = await CourseRepository.findById(id);
        if (!course || course.tutor.toString() !== userId) {
            throw new Error('Unauthorized: You are not the tutor of this course');
        }
        return await CourseRepository.delete(id);
    }
}

export default new CourseService();
