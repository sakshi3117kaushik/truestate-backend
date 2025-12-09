import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  phoneNumber: String,
  gender: String,
  age: Number,
  customerRegion: String,
  customerType: String,

  productId: String,
  productName: String,
  brand: String,
  productCategory: String,
  tags: [String],

  quantity: Number,
  pricePerUnit: Number,
  discountPercentage: Number,
  totalAmount: Number,
  finalAmount: Number,

  date: Date,
  paymentMethod: String,
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,

  salespersonId: String,
  employeeName: String,
});

// add compound unique index (adjust to your accurate uniqueness logic)
saleSchema.index({ customerId: 1, productId: 1, date: 1 }, { unique: true, sparse: true });
export default mongoose.model("Sale", saleSchema);
