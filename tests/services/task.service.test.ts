import {TASKS_CACHE_KEY, createTask, CreateTaskInput, getTasks} from '../../src/services/task.service';
import { Task } from '../../src/models/task.model';
import redis from '../../src/utils/redis';


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
    const mockTaskData: CreateTaskInput = {
        title: 'Mock Task',
        description: 'Mock Desc',
        status: "pending",
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/tasks', () => {
        it('should return tasks from cache if present', async () => {
            const cachedData = JSON.stringify([{ _id: '1', title: 'Cached Task' }]);
            (redis.get as jest.Mock).mockResolvedValue(cachedData);

            const tasks = await getTasks();

            expect(redis.get).toHaveBeenCalledWith('tasks:all');
            expect(tasks).toEqual(JSON.parse(cachedData));
            expect(Task.find).not.toHaveBeenCalled();
        });

        it('should fetch from DB and cache it if cache is empty', async () => {
            const dbTasks = [{ _id: '2', title: 'DB Task' }];
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

    describe('POST /api/tasks', () => {
        it('should create a task using the model', async () => {
            const mockSave = jest.fn().mockResolvedValue({
                _id: '123abc',
                ...mockTaskData,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            (Task as any).mockImplementation(() => ({ save: mockSave }));
            const redisDelSpy = jest.spyOn(redis, 'del');

            const result = await createTask(mockTaskData);

            expect(mockSave).toHaveBeenCalled();
            expect(redisDelSpy).toHaveBeenCalledWith(TASKS_CACHE_KEY)
            expect(result.title).toBe('Mock Task');
        });
    });
});
