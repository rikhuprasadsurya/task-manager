import request from 'supertest';
import app from '../src';
import mongoose from "mongoose";
import redis from '../src/utils/redis';

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/taskdb-test');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await redis.quit();
});

describe('Task API', () => {
    it('should return empty list of tasks', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return list of available tasks', async () => {
        const savedTask = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test Task',
                description: 'This is a test task',
                status: 'in-progress'});

        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toEqual('Test Task');
    });

    it('should return a task for a given id', async () => {
        const savedTask = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test Task',
                description: 'This is a test task',
                status: 'in-progress'});

        const res = await request(app).get(`/api/tasks/${savedTask.body._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toEqual('Test Task');
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

    it('should update a existing task', async () => {
        const savedTask = await request(app)
            .post('/api/tasks')
            .send({ title: 'Test Task',
                description: 'original description',
                status: 'in-progress'});

        const res = await request(app)
            .put(`/api/tasks/${savedTask.body._id}`)
            .send({ title: 'Updated Test Task',
                status: 'done'});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe('Updated Test Task');
        expect(res.body.description).toBe('original description');
        expect(res.body.status).toBe('done');
    });
});
