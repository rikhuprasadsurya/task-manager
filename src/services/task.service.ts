import redis from '../utils/redis';
import {ITask, Task} from '../models/task.model';

export type CreateTaskInput = Pick<ITask, 'title' | 'description' | 'status'>;
export const cacheKey = 'tasks:all';

export const getTasks = async (): Promise<ITask[]> => {
    return [];
};

export const getCachedTasks = async () => {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const tasks = await Task.find().lean();
    await redis.set(cacheKey, JSON.stringify(tasks), 'EX', 60); // 1 min TTL

    return tasks;
};

export const createTask = async (data: Partial<CreateTaskInput>): Promise<ITask> => {
    const task = new Task(data);
    const savedTask = await task.save();

    await redis.del(cacheKey);

    return savedTask;
};