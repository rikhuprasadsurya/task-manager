import {createTaskHandler, getTaskByIdHandler, getTaskHandler} from '../../src/controllers/task.controller';
import * as taskService from '../../src/services/task.service';
import { Request, Response } from 'express';
import redis from '../../src/utils/redis';
import mongoose from "mongoose";

afterAll(async () => {
    await redis.quit();
});

describe('Task Controller', () => {
    const mockTaskId = new mongoose.Types.ObjectId().toHexString();
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any as Response;

    describe('POST /api/tasks', () => {
        const mockRequestWithTask = {
            body: {
                title: 'Controller Test',
                description: 'Test Desc',
                status: 'pending',
            },
        } as Request;

        it('should create a task when a valid task is given', async () => {
            const mockServiceReturnValue = {
                _id: mockTaskId,
                ...mockRequestWithTask.body,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(taskService, 'createTask').mockResolvedValue(mockServiceReturnValue);

            await createTaskHandler(mockRequestWithTask, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockServiceReturnValue);
        });

        it('should return Bad Request 400 error When task creation fails', async () => {
            const error = new Error('invalid data');

            jest.spyOn(taskService, 'createTask').mockRejectedValue(error);

            await createTaskHandler(mockRequestWithTask, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                {error: 'invalid data'}
            );
        });
    });

    describe('GET /api/tasks', () => {
        const mockRequest = {
            body: {},
        } as Request;

        it('should get all tasks', async () => {
            const mockServiceReturnValue = [{
                _id: new mongoose.Types.ObjectId().toHexString(),
                title: 'Controller Test 1',
                description: 'Test Desc 1',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            }, {
                _id: new mongoose.Types.ObjectId().toHexString(),
                title: 'Controller Test 2',
                description: 'Test Desc 2',
                status: 'in-progress',
                createdAt: new Date(),
                updatedAt: new Date(),
            }];

            jest.spyOn(taskService, 'getTasks').mockResolvedValue(mockServiceReturnValue);

            await getTaskHandler(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockServiceReturnValue);
        });

        it('should return Bad Request 400 error when fetching tasks fails', async () => {
            const error = new Error('some error');

            jest.spyOn(taskService, 'getTasks').mockRejectedValue(error);

            await getTaskHandler(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({error: error.message});
        });
    });

    describe('GET /api/tasks/:id', () => {
        const mockRequest = {
            params: {
                id: mockTaskId,
            },
        } as any as Request;

        it('should get a task by id', async () => {
            const mockServiceReturnValue = {
                _id: mockTaskId,
                title: 'Controller Test 1',
                description: 'Test Desc 1',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const getTaskByIdSpy = jest.spyOn(taskService, 'getTaskById').mockResolvedValue(mockServiceReturnValue);

            await getTaskByIdHandler(mockRequest, mockResponse);

            expect(getTaskByIdSpy).toHaveBeenCalledWith(mockTaskId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockServiceReturnValue);
        });

        it('should return Bad Request 400 error when fetching a task fails', async () => {
            const error = new Error('some error');

            jest.spyOn(taskService, 'getTaskById').mockRejectedValue(error);

            await getTaskByIdHandler(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({error: error.message});
        });
    });
});
