import mongoose from 'mongoose';
import { Task } from '../src/models/task.model';

const generateFakeTasks = async () => {
    if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
    }

    await mongoose.connect(process.env.MONGO_URI!);

    const tasks = Array.from({ length: 10000 }).map((_, i) => ({
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        status: ['pending', 'in-progress', 'done'][Math.floor(Math.random() * 3)],
    }));

    await Task.insertMany(tasks);
    console.log('✅ 10,000 tasks generated.');
    process.exit(0);
};

generateFakeTasks().catch(err => {
    console.error(err);
    process.exit(1);
});