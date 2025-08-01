export class NotFoundError extends Error {
    statusCode = 401;
    constructor(message: string = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class BadRequestError extends Error {
    statusCode = 400;
    constructor(message: string = 'Bad request') {
        super(message);
        this.name = 'BadRequestError';
    }
}
