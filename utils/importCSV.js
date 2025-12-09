// utils/importCSV.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Sale from "../models/Sales.js";
import fs from "fs";
import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your CSV
const csvFilePath = path.resolve(__dirname, "../data/truestate_assignment_dataset.csv");

// Tunable batch size: smaller -> less memory but more DB operations
const BATCH_SIZE = 1000;

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const norm = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "na") return null;
  return s;
};

const parseNumber = (v) => {
  if (v === undefined || v === null) return null;
  // strip commas and currency
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const parseDate = (v) => {
  const s = norm(v);
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  // try fallback parse
  const t = Date.parse(s);
  return isNaN(t) ? null : new Date(t);
};

const mapRowToDoc = (row) => {
  const tagsRaw = row["Tags"] ?? row.tags ?? "";
  const tags = String(tagsRaw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    customerId: norm(row["Customer ID"] ?? row.customerId),
    customerName: norm(row["Customer Name"] ?? row.customerName),
    phoneNumber: norm(row["Phone Number"] ?? row.phoneNumber),
    gender: norm(row["Gender"] ?? row.gender),
    age: parseNumber(row["Age"] ?? row.age),
    customerRegion: norm(row["Customer Region"] ?? row.customerRegion),
    customerType: norm(row["Customer Type"] ?? row.customerType),

    productId: norm(row["Product ID"] ?? row.productId),
    productName: norm(row["Product Name"] ?? row.productName),
    brand: norm(row["Brand"] ?? row.brand),
    productCategory: norm(row["Product Category"] ?? row.productCategory),
    tags,

    quantity: parseNumber(row["Quantity"] ?? row.quantity),
    pricePerUnit: parseNumber(row["Price Per Unit"] ?? row.pricePerUnit),
    discountPercentage: parseNumber(row["Discount Percentage"] ?? row.discountPercentage),
    totalAmount: parseNumber(row["Total Amount"] ?? row.totalAmount),
    finalAmount: parseNumber(row["Final Amount"] ?? row.finalAmount),

    date: parseDate(row["Date"] ?? row.date),
    paymentMethod: norm(row["Payment Method"] ?? row.paymentMethod),
    orderStatus: norm(row["Order Status"] ?? row.orderStatus),
    deliveryType: norm(row["Delivery Type"] ?? row.deliveryType),
    storeId: norm(row["Store ID"] ?? row.storeId),
    storeLocation: norm(row["Store Location"] ?? row.storeLocation),

    salespersonId: norm(row["Salesperson ID"] ?? row.salespersonId),
    employeeName: norm(row["Employee Name"] ?? row.employeeName),
  };
};

const importCSV = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected.");

  if (!fs.existsSync(csvFilePath)) {
    console.error("CSV file not found at:", csvFilePath);
    process.exit(1);
  }

  const readStream = fs.createReadStream(csvFilePath);
  const parser = csv({ trim: true, ignoreEmpty: true }).fromStream(readStream);

  let batch = [];
  let rowCount = 0;
  let insertedCount = 0;
  let batchCount = 0;

  try {
    // csv().fromStream(...).subscribe supports async callback and returns a Promise that resolves when done
    await parser.subscribe(
      async (rawRow, index) => {
        rowCount++;
        const doc = mapRowToDoc(rawRow);
        batch.push(doc);

        if (batch.length >= BATCH_SIZE) {
          batchCount++;
          const toInsert = batch;
          batch = [];
          try {
            const res = await Sale.insertMany(toInsert, { ordered: false });
            insertedCount += (res && res.length) || 0;
            console.log(`Inserted batch ${batchCount}: ${res.length} docs (total inserted: ${insertedCount})`);
          } catch (err) {
            // log but continue
            console.error(`Error inserting batch ${batchCount}:`, err.message || err);
            if (err.writeErrors) {
              console.error(`Write errors: ${err.writeErrors.length}`);
            }
          }
        }

        // return true to continue; if you return false, it will stop
        return true;
      },
      (err) => {
        // this is the error callback, but we mostly rely on the awaited promise throwing
        if (err) {
          console.error("Parser subscribe error:", err);
        }
      }
    );

    // After subscribe resolves, there may be leftover docs in batch
    if (batch.length > 0) {
      batchCount++;
      try {
        const res = await Sale.insertMany(batch, { ordered: false });
        insertedCount += (res && res.length) || 0;
        console.log(`Inserted final batch ${batchCount}: ${res.length} docs (total inserted: ${insertedCount})`);
      } catch (err) {
        console.error(`Error inserting final batch ${batchCount}:`, err.message || err);
      }
    }

    console.log(`Done. Rows processed: ${rowCount}. Documents inserted: ${insertedCount}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Fatal import error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

importCSV();
