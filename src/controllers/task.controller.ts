import { Request, Response } from 'express';
import {getTasks, createTask, getTaskById} from '../services/task.service';

export const getTaskHandler = async (req: Request, res: Response) => {
    try {
        const task = await getTasks();
        res.status(200).json(task);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getTaskByIdHandler = async (req: Request, res: Response) => {
    try {
        const task = await getTaskById(req.params.id);
        res.status(200).json(task);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const createTaskHandler = async (req: Request, res: Response) => {
    try {
        const task = await createTask(req.body);
        res.status(201).json(task);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
