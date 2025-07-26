import request from 'supertest';
import app from '../src';
import mongoose from "mongoose";

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/taskdb-test');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Task API', () => {
    it('should return empty list of tasks', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should create a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test Task',
                description: 'This is a test task',
                status: 'in-progress'});

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe('Test Task');
        expect(res.body.description).toBe('This is a test task');
        expect(res.body.status).toBe('in-progress');
    });
});
