import express from "express";
import {
  addToWishlist,
  clearWishlist,
  getwishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
const router = express.Router();

router.get("/", getwishlist);
router.post("/add", addToWishlist);
router.delete("/rm", removeFromWishlist);
router.delete("/clr", clearWishlist);

export default router;
