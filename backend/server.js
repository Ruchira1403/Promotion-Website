import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables first, before any other imports
import './config/env.js';

// Debug environment variables
console.log('Server.js - Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
console.log('Server.js - GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? 'Found' : 'Missing');

// Now import other modules
import passport from "./config/passport.js";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/auth.js";
import socialAuthRoutes from "./routes/socialAuth.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import ordersRoutes from "./routes/orders.js";
import contactRoutes from './routes/contact.js';

// App config
const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/products');
fs.mkdirSync(uploadsDir, { recursive: true });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Export app before connecting to DB
export default app;

// Connect to MongoDB and start server only if this file is run directly
if (process.env.NODE_ENV !== 'test') {
    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => {
        console.log("Connected to MongoDB");
        
        // Start server after successful connection
        app.listen(port, () => {
            console.log(`Server started on PORT: ${port}`);
        });
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
}
