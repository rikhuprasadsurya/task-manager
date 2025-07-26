import {ITask, Task} from '../models/task.model';

type CreateTaskInput = Pick<ITask, 'title' | 'description' | 'status'>;

export const getTasks = async (): Promise<ITask[]> => {
    return [];
};

export const createTask = async (data: Partial<CreateTaskInput>): Promise<ITask> => {
    const task = new Task(data);
    return await task.save();
};