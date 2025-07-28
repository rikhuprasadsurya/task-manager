import {cacheKey, createTask, CreateTaskInput} from '../../src/services/task.service';
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
        expect(redisDelSpy).toHaveBeenCalledWith(cacheKey)
        expect(result.title).toBe('Mock Task');
    });
});
