import mongoose from "mongoose";

const operationSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking", "Wallet"],
      required: true,
    },

    deliveryType: {
      type: String,
      enum: ["Pickup", "Delivery"],
      required: true,
    },

    storeId: {
      type: String,
      required: true,
      trim: true,
    },

    storeLocation: {
      type: String,
      required: true,
      trim: true,
    },

    salespersonId: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Operation = mongoose.model("Operation", operationSchema);

export default Operation;
