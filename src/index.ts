import express from 'express';
import taskRoutes from "./routes/task.routes";

const app = express();
app.use(express.json());

app.use('/api/tasks', taskRoutes);

export default app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server running on port 3000'));
}
