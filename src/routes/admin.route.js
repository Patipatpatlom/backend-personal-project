import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

// 👑 ADMIN ONLY - GET ALL ORDERS
router.get("/orders", protect, getAllOrders);

// 👑 ADMIN ONLY - UPDATE ORDER STATUS
router.patch("/orders/:orderId", protect, updateOrderStatus);

// 👑 ADMIN ONLY - DELETE COMPLETED ORDER
router.delete("/orders/:orderId", protect, deleteOrder);

export default router;