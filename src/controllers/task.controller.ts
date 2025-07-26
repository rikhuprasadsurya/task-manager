import { Request, Response } from 'express';
import { getTasks } from '../services/task.service';

export const getTaskHandler = async (req: Request, res: Response) => {
    try {
        const task = await getTasks();
        res.status(200).json(task);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
