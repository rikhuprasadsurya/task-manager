import { Router } from 'express';
import { getTaskHandler } from '../controllers/task.controller';

const router = Router();

router.get('/', getTaskHandler);

export default router;