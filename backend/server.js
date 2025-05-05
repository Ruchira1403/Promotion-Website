import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/auth.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Export app before connecting to DB
export default app;

// Connect to MongoDB and start server only if this file is run directly
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    app.listen(port, () => {
        console.log(`Server started on PORT: ${port}`);
    });
}
