import Module from '../../domain/models/Module.js';

class ModuleRepository {
    async create(moduleData) {
        return await Module.create(moduleData);
    }

    async findAll() {
        return await Module.find().populate('course');
    }

    async findById(id) {
        return await Module.findById(id).populate('course');
    }

    async update(id, updateData) {
        return await Module.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Module.findByIdAndDelete(id);
    }
}

export default new ModuleRepository();
