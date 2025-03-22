import express from 'express';
import ModuleController from '../controllers/ModuleController.js';

const router = express.Router();

router.get('/', ModuleController.getAll);
router.post('/', ModuleController.create);
router.get('/:id', ModuleController.getById);
router.put('/:id', ModuleController.update);
router.delete('/:id', ModuleController.delete);

export default router;
