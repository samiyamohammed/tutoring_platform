import ModuleService from '../../application/services/ModuleService.js';

class ModuleController {
    async getAll(req, res) {
        try {
            const modules = await ModuleService.getAllModules();
            res.status(200).json(modules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const module = await ModuleService.getModuleById(req.params.id);
            res.status(200).json(module);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            console.log(req.user._id);
            const module = await ModuleService.createModule(req.body, req.user._id);
            res.status(201).json(module);
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const module = await ModuleService.updateModule(req.params.id, req.user._id, req.body);
            res.status(200).json(module);
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await ModuleService.deleteModule(req.params.id, req.user._id);
            res.status(200).json({ message: 'Module deleted successfully' });
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
}

export default new ModuleController();
