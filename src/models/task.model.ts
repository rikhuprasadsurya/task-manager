import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'done';
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'done'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
