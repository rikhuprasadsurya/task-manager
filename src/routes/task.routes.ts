import { Router } from 'express';
import {getTaskHandler, createTaskHandler, getTaskByIdHandler} from '../controllers/task.controller';

const router = Router();

router.get('/api/tasks', getTaskHandler);
router.get('/api/tasks/:id', getTaskByIdHandler);
router.post('/api/tasks', createTaskHandler);

export default router;