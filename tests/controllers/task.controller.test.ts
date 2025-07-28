import { createTaskHandler } from '../../src/controllers/task.controller';
import * as taskService from '../../src/services/task.service';
import { Request, Response } from 'express';
import redis from '../../src/utils/redis';

afterAll(async () => {
    await redis.quit();
});

describe('Task Controller', () => {
    const mockRequest = {
        body: {
            title: 'Controller Test',
            description: 'Test Desc',
            status: 'pending',
        },
    } as Request;

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any as Response;

    it('should call service and respond with 201', async () => {
        const mockServiceReturnValue = {
            _id: 'xyz123',
            ...mockRequest.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(taskService, 'createTask').mockResolvedValue(mockServiceReturnValue);

        await createTaskHandler(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockServiceReturnValue);
    });
});
