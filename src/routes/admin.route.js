import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

// 👑 ADMIN ONLY - GET ALL ORDERS
router.get("/orders", protect, getAllOrders);

// 👑 ADMIN ONLY - UPDATE ORDER STATUS
router.patch("/orders/:orderId", protect, updateOrderStatus);

export default router;