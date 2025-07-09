import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: {
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
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
  featured: {
    type: Boolean,
    default: false,
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
// يمكن حذف دالة toJSON لأنها لم تعد مناسبة مع الشكل الجديد للصور

export const Product = mongoose.model("Product", productSchema);
