import express, {Request, Response} from 'express';
import taskRouter from "./routes/task.routes";

const app = express();
app.use(express.json());

app.use('/api/tasks', taskRouter);

//heath endpoint
app.get('/health', (_req: Request, _res: Response) => {_res.send('API is running...')});

export default app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

