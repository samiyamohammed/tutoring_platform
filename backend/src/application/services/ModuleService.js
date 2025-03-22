import ModuleRepository from '../../infrastructure/repositories/ModuleRepository.js';
import CourseRepository from '../../infrastructure/repositories/CourseRepository.js';

class ModuleService {
    async createModule(moduleData, userId) {
        const course = await CourseRepository.findById(moduleData.course);
        
        if (!course) {
            throw new Error('Course not found');
        }

        if (!course.tutor.equals(userId)) {  
            throw new Error('Unauthorized: You are not the tutor of this course');
        }

        return await ModuleRepository.create(moduleData);
    }

    async updateModule(id, userId, updateData) {
        const module = await ModuleRepository.findById(id);
        if (!module) throw new Error('Module not found');

        const course = await CourseRepository.findById(module.course);
        if (!course || course.tutor.toString() !== userId) {
            throw new Error('Unauthorized: You are not the tutor of this course');
        }

        return await ModuleRepository.update(id, updateData);
    }

    async deleteModule(id, userId) {
        const module = await ModuleRepository.findById(id);
        if (!module) throw new Error('Module not found');

        const course = await CourseRepository.findById(module.course);
        if (!course || course.tutor.toString() !== userId) {
            throw new Error('Unauthorized: You are not the tutor of this course');
        }

        return await ModuleRepository.delete(id);
    }
}

export default new ModuleService();
