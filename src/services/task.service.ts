import redis from '../utils/redis';
import {ITask, Task} from '../models/task.model';

export type CreateTaskInput = Pick<ITask, 'title' | 'description' | 'status'>;
export const TASKS_CACHE_KEY = 'tasks:all';

export async function getTasks() {
    const cached = await redis.get(TASKS_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const tasks = await Task.find().lean();
    await redis.set(TASKS_CACHE_KEY, JSON.stringify(tasks));

    return tasks;
}

export const createTask = async (data: Partial<CreateTaskInput>): Promise<ITask> => {
    const task = new Task(data);
    const savedTask = await task.save();

    await redis.del(TASKS_CACHE_KEY);

    return savedTask;
};