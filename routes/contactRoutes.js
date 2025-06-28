import express from "express";
const router = express.Router();
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from "../controllers/contactController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

// Public route - submit contact form
router.post("/", createContact);

// Protected routes - admin only
router.get("/", authenticate, authorize("admin"), getAllContacts);
router.get("/stats", authenticate, authorize("admin"), getContactStats);
router.get("/:id", authenticate, authorize("admin"), getContactById);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateContactStatus
);
router.delete("/:id", authenticate, authorize("admin"), deleteContact);

export default router;
