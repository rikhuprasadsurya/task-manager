import redis from '../utils/redis';
import {ITask, Task} from '../models/task.model';
import mongoose from "mongoose";
import {BadRequestError, NotFoundError} from "../utils/errors";

export type CreateTaskInput = Pick<ITask, 'title' | 'description' | 'status'>;
export const TASKS_CACHE_KEY = 'tasks:all';

export async function getTasks() {
    const cached = await redis.get(TASKS_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const tasks = await Task.find().lean();
    await redis.set(TASKS_CACHE_KEY, JSON.stringify(tasks));

    return tasks;
}

export async function getTaskById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid task ID');
    }

    const task = await Task.findById(id).lean();

    if(!task){
        throw new NotFoundError('Task not found');
    }

    return task;
}

export const createTask = async (data: Partial<CreateTaskInput>): Promise<ITask> => {
    try{
        const task = new Task(data);
        const savedTask = await task.save();

        await redis.del(TASKS_CACHE_KEY);

        return savedTask;
    } catch (err:any) {
        throw err;
    }
};