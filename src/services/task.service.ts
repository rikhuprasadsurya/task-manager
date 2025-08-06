import redis from '../utils/redis';
import {ITask, Task} from '../models/task.model';
import mongoose from "mongoose";
import {BadRequestError, NotFoundError} from "../utils/errors";
import {PaginationResult} from "../models/paginationResult.model";

export type CreateTaskInput = Pick<ITask, 'title' | 'description' | 'status'>;
export const TASKS_CACHE_KEY = 'tasks:all';

export const createTask = async (data: Partial<CreateTaskInput>): Promise<ITask> => {
    const task = new Task(data);
    const savedTask = await task.save();

    await redis.del(TASKS_CACHE_KEY);

    return savedTask;
}

export async function getTasks() {
    const cached = await redis.get(TASKS_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const tasks = await Task.find().lean();
    await redis.set(TASKS_CACHE_KEY, JSON.stringify(tasks));

    return tasks;
}

export async function getTasksByFilter(pageNumber: number, pageSize: number): Promise<PaginationResult> {
    const skip = (pageNumber-1) * pageSize;

    const tasks = await Task.find()
        .skip(skip)
        .limit(pageSize);
    const total = await Task.countDocuments();

    return {
        pageNumber: pageNumber,
        pageSize: pageSize,
        tasks: tasks,
        total: total
    };
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


export const updateTask = async (id:string, data: Partial<CreateTaskInput>): Promise<ITask> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid task ID');
    }

    const updatedTask = await Task.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).lean();

    if(updatedTask){
        await redis.del(TASKS_CACHE_KEY);
        return updatedTask;
    } else {
        throw new NotFoundError();
    }
}