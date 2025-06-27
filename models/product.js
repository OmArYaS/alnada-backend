import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.images && Array.isArray(obj.images)) {
    obj.images = obj.images.map((img) => `${process.env.BASE_URL}${img}`);
  }
  return obj;
};

export const Product = mongoose.model("Product", productSchema);
