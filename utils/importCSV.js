import mongoose from "mongoose";
import dotenv from "dotenv";
import Sale from "../models/Sale.js";
import fs from "fs";
import csv from "csvtojson";

dotenv.config();

const importCSV = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    // Read CSV file
    const csvFilePath = "./data/sales.csv";

    const jsonArray = await csv().fromFile(csvFilePath);

    // OPTIONAL: transform CSV fields to match schema
    const formatted = jsonArray.map((row) => ({
      customerId: row["Customer ID"],
      customerName: row["Customer Name"],
      phoneNumber: row["Phone Number"],
      gender: row["Gender"],
      age: Number(row["Age"]) || null,
      customerRegion: row["Customer Region"],
      customerType: row["Customer Type"],

      productId: row["Product ID"],
      productName: row["Product Name"],
      brand: row["Brand"],
      productCategory: row["Product Category"],
      tags: row["Tags"] ? row["Tags"].split(",") : [],

      quantity: Number(row["Quantity"]),
      pricePerUnit: Number(row["Price Per Unit"]),
      discountPercentage: Number(row["Discount Percentage"]),
      totalAmount: Number(row["Total Amount"]),
      finalAmount: Number(row["Final Amount"]),

      date: new Date(row["Date"]),
      paymentMethod: row["Payment Method"],
      orderStatus: row["Order Status"],
      deliveryType: row["Delivery Type"],
      storeId: row["Store ID"],
      storeLocation: row["Store Location"],

      salespersonId: row["Salesperson ID"],
      employeeName: row["Employee Name"],
    }));

    await Sale.insertMany(formatted);

    console.log("CSV Imported Successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importCSV();
