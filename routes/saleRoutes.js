import express from "express";
import { getSales } from "../controllers/saleController.js";

const router = express.Router();

router.get("/", getSales);

export default router;
