import express, {Request, Response} from 'express';
import taskRouter from "./routes/task.routes";
import {connectDB} from "./utils/db";

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

connectDB().catch((err) => {
    console.error('Failed to start DB:', err);
});

const app = express();
app.use(express.json());

app.use('/', taskRouter);

//heath endpoint
app.get('/health', (_req: Request, _res: Response) => {_res.send('API is running...')});

export default app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server running on port 3000'));
}
