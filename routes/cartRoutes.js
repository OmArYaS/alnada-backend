import express from "express";
import {
  addToCart,
  checkout,
  clearCart,
  getCart,
  getCartCount,
  removeFromCart,
  updateCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/get", getCart);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);
router.put("/update", updateCart);
router.get("/checkout", checkout);
router.get("/Count", getCartCount);

export default router;
