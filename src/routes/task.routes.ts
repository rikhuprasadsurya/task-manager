import { Router } from 'express';
import {getTasksHandler, createTaskHandler, getTaskByIdHandler, updateTaskHandler} from '../controllers/task.controller';

const router = Router();

router.get('/api/tasks', getTasksHandler);
router.get('/api/tasks/:id', getTaskByIdHandler);
router.post('/api/tasks', createTaskHandler);
router.put('/api/tasks/:id', updateTaskHandler);

export default router;