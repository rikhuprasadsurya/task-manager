import {
    TASKS_CACHE_KEY,
    createTask,
    CreateTaskInput,
    getTasks,
    getTaskById,
    updateTask
} from '../../src/services/task.service';
import { Task } from '../../src/models/task.model';
import redis from '../../src/utils/redis';
import mongoose from "mongoose";
import {BadRequestError, NotFoundError} from "../../src/utils/errors";

jest.mock('../../src/models/task.model');
jest.mock('ioredis', () => {
    const mRedis = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        on: jest.fn(),
    };
    return jest.fn(() => mRedis);
});

describe('Task Service', () => {


    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/tasks', () => {
        it('should return tasks from cache if present', async () => {
            const cachedData = JSON.stringify([{_id: '1', title: 'Cached Task'}]);
            (redis.get as jest.Mock).mockResolvedValue(cachedData);

            const tasks = await getTasks();

            expect(redis.get).toHaveBeenCalledWith('tasks:all');
            expect(tasks).toEqual(JSON.parse(cachedData));
            expect(Task.find).not.toHaveBeenCalled();
        });

        it('should fetch from DB and cache it if cache is empty', async () => {
            const dbTasks = [{_id: '2', title: 'DB Task'}];
            (redis.get as jest.Mock).mockResolvedValue(null);
            (Task.find as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(dbTasks),
            });
            (redis.set as jest.Mock).mockResolvedValue('OK');

            const tasks = await getTasks();

            expect(redis.get).toHaveBeenCalledWith('tasks:all');
            expect(Task.find).toHaveBeenCalled();
            expect(redis.set).toHaveBeenCalledWith('tasks:all', JSON.stringify(dbTasks));
            expect(tasks).toEqual(dbTasks);
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('should fetch a task when task id is given', async () =>{
            const taskIdToFetch = new mongoose.Types.ObjectId().toHexString();
            const dbTask = { _id: taskIdToFetch, title: 'DB Task 1' };
            (Task.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(dbTask),
            });

            const task = await getTaskById(taskIdToFetch);

            expect(Task.findById).toHaveBeenCalled();
            expect(task).toEqual(dbTask);
        });

        it('should throw an Error (Invalid task id) when task id is invalid', async () =>{
            const invalidId = '123';

            await expect(getTaskById(invalidId)).rejects.toThrow('Invalid task ID');
            expect(Task.findById).not.toHaveBeenCalled();
        });

        it('should throw an Error (Task Not Found) when task does not exist', async () =>{
            const taskIdToFetch = new mongoose.Types.ObjectId().toHexString();
            (Task.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(undefined),
            });

            await expect(getTaskById(taskIdToFetch)).rejects.toThrow('Task not found');
            expect(Task.findById).toHaveBeenCalledWith(taskIdToFetch);
        });
    });

    describe('POST /api/tasks', () => {
        const mockTaskData: CreateTaskInput = {
            title: 'Mock Task',
            description: 'Mock Desc',
            status: "pending",
        };
        const mockSave = jest.fn().mockResolvedValue({
            _id: '123abc',
            ...mockTaskData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        it('should create a task using the model', async () => {
            (Task as any).mockImplementation(() => ({ save: mockSave }));
            const redisDelSpy = jest.spyOn(redis, 'del');

            const result = await createTask(mockTaskData);

            expect(mockSave).toHaveBeenCalled();
            expect(result.title).toBe('Mock Task');
        });

        it('should delete all tasks cache when save is successful', async () => {
            (Task as any).mockImplementation(() => ({ save: mockSave }));
            const redisDelSpy = jest.spyOn(redis, 'del');

            const result = await createTask(mockTaskData);

            expect(mockSave).toHaveBeenCalled();
            expect(redisDelSpy).toHaveBeenCalledWith(TASKS_CACHE_KEY)
        });

        it('should throw error when save fails', async () => {
            const mockSave = jest.fn().mockRejectedValue(new Error('invalid data'));

            (Task as any).mockImplementation(() => ({ save: mockSave }));
            const redisDelSpy = jest.spyOn(redis, 'del');

            await expect(createTask(mockTaskData)).rejects.toThrow('invalid data');
            expect(mockSave).toHaveBeenCalled();
            expect(redisDelSpy).not.toHaveBeenCalled();
        });
    });

    describe('PUT /api/task/:id', () => {
        const mockUpdatedTaskData: CreateTaskInput = {
            title: 'Updated Mock Task',
            description: 'Updated Mock Desc',
            status: "done",
        };

        it('should update a task for a given id', async () => {
            const mockTaskId = new mongoose.Types.ObjectId().toHexString();
            jest.spyOn(Task, 'findByIdAndUpdate').mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: mockTaskId,
                    ...mockUpdatedTaskData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            } as any);

            const result = await updateTask(mockTaskId, mockUpdatedTaskData);

            expect(Task.findByIdAndUpdate).toHaveBeenCalled();
            expect(result.title).toBe('Updated Mock Task');
        });

        it('should delete all tasks cache when a task is updated', async () => {
            const mockTaskId = new mongoose.Types.ObjectId().toHexString();
            jest.spyOn(Task, 'findByIdAndUpdate').mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: mockTaskId,
                    ...mockUpdatedTaskData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            } as any);
            const redisDelSpy = jest.spyOn(redis, 'del');

            const result = await updateTask(mockTaskId, mockUpdatedTaskData);

            expect(Task.findByIdAndUpdate).toHaveBeenCalled();
            expect(redisDelSpy).toHaveBeenCalledWith(TASKS_CACHE_KEY);
        });

        it('should throw an Error (Invalid task id) when task id is invalid', async () => {
            const mockTaskId = '123'; //invalid id
            const redisDelSpy = jest.spyOn(redis, 'del');

            await expect(updateTask(mockTaskId, mockUpdatedTaskData)).rejects.toThrow('Invalid task ID');
            expect(Task.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(redisDelSpy).not.toHaveBeenCalled();
        });

        it('should throw an Error (Not Found Error) when task id is not found', async () => {
            const mockTaskId = new mongoose.Types.ObjectId().toHexString();
            jest.spyOn(Task, 'findByIdAndUpdate').mockReturnValue({
                lean: jest.fn().mockResolvedValue(undefined)
            } as any);
            const redisDelSpy = jest.spyOn(redis, 'del');

            await expect(updateTask(mockTaskId, mockUpdatedTaskData)).rejects.toThrow(NotFoundError);
            expect(Task.findByIdAndUpdate).toHaveBeenCalled();
            expect(redisDelSpy).not.toHaveBeenCalled();
        });
    });
});
