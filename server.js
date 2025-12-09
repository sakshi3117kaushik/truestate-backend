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
app.use(
  cors({
    origin: "https://truestate-frontend-jet.vercel.app", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Or allow all origins (for testing only)
app.use(cors());


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
