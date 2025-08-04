import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        if(process.env.MONGO_URI){
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 30000
            });

            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } else {
            console.error('MongoDB URI is not defined!')
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit on failure
    }
};
