import mongoose from 'mongoose';
import { Task } from '../models/task.model';

describe('Task Model', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/taskdb-test');
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    it('should create a task with correct fields', async () => {
        const task = new Task({
            title: 'Write tests',
            description: 'Write unit tests for the model',
            status: 'pending'
        });

        const savedTask = await task.save();

        expect(savedTask._id).toBeDefined();
        expect(savedTask.title).toBe('Write tests');
        expect(savedTask.status).toBe('pending');
    });
});
