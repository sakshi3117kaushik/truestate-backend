import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./utils/db.js";
import cors from "cors";
import salesRoutes from "./routes/saleRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));

// Connect MongoDB
connectDB();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
  app.use("/api/auth", authRoutes);
  app.use("/api/sales", salesRoutes);
// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
