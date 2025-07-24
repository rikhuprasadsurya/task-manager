import request from 'supertest';
import app from '../src';

describe('Task API', () => {
    it('should return empty list of tasks', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});
