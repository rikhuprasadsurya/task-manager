import { Router } from 'express';
import { getTaskHandler, createTaskHandler } from '../controllers/task.controller';

const router = Router();

router.get('/', getTaskHandler);
router.post('/', createTaskHandler);

export default router;