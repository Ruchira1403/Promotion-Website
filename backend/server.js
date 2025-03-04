import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/auth.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API endpoints
app.get("/", (req, res) => {
  res.send("API working");
});

// Routes
app.use("/api/auth", authRoutes);

app.listen(port, () => console.log("Server started on PORT: " + port));
