import {createTask, CreateTaskInput} from '../../src/services/task.service';
import { Task } from '../../src/models/task.model';

// mock Task model
jest.mock('../../src/models/task.model');

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

        const result = await createTask(mockTaskData);

        expect(mockSave).toHaveBeenCalled();
        expect(result.title).toBe('Mock Task');
    });
});
