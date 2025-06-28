import express from "express";
import appRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { authenticate } from "./middlewares/authenticate.js";
import { authorize } from "./middlewares/authorize.js";

import cors from "cors";
import categoryRoutes from "./routes/categoryRoutes.js";

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("public/images"));
app.use("/api/auth", authRoutes);
app.use("/api/products", appRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/cart", authenticate, authorize("admin", "user"), cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", userRoutes);

app.get("/healthz", (req, res) => {
  res.status(200).json({ message: "OK" });
});
