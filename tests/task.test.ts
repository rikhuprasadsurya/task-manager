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
});
