import express from 'express';

const app = express();
app.use(express.json());

let tasks: any[] = [];

app.get('/tasks', (_req, res) => {
    res.status(200).json(tasks);
});

export default app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server running on port 3000'));
}
