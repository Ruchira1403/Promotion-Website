import mongoose from "mongoose";

const connectDB = async (uri) => {
    try {
        // Use the provided URI or fall back to environment variable
        const connectionString = uri || `${process.env.MONGODB_URI}/promotion-website`;
        
        if (mongoose.connection.readyState === 1) {
            return; // Already connected
        }
        
        await mongoose.connect(connectionString);
        console.log('MongoDB connected');
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;