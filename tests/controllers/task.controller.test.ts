import { createTaskHandler } from '../../src/controllers/task.controller';
import * as taskService from '../../src/services/task.service';
import { Request, Response } from 'express';
import redis from '../../src/utils/redis';
import {BadRequestError} from "../../src/utils/errors";

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

    describe('POST /api/tasks', () => {
        it('should create a task when a valid task is given', async () => {
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

        it('should return Bad Request 400 error When task creation fails', async () => {
            const error = new Error('invalid data');

            jest.spyOn(taskService, 'createTask').mockRejectedValue(error);

            await createTaskHandler(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                {error: 'invalid data'}
            );
        });
    });
});
