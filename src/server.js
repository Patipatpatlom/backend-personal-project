import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import db from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import dessertRouter from "./routes/dessert.routes.js";
import orderRoutes from "./routes/order.routes.js";
import errHandler from "./middleware/errHandler.js";
import cartRoutes from "./routes/cart.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();
const PORT = 5000;

// 🌐 HTTP SERVER (สำคัญมากสำหรับ socket)
const server = http.createServer(app);

// 🔴 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// ⚡ export io ให้ controller ใช้ได้
export { io };

// 🧠 Register io globally in Express app to avoid circular dependencies
app.set("io", io);

// 🔌 socket connection
io.on("connection", (socket) => {
  console.log("⚡ Admin/User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

// 🧠 middleware
app.use(cors());
app.use(express.json());

// 🧪 log request
app.use((req, res, next) => {
  console.log("🔥 REQUEST:", req.method, req.url);
  next();
});

// 🏠 root route
app.get("/", (req, res) => {
  res.send("Welcome Api v0.1.0 🚀");
});

// 📦 routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/desserts", dessertRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));


// ❌ error handler (ต้องอยู่ล่างสุด)
app.use(errHandler);

// 🚀 start server (IMPORTANT: ใช้ server ไม่ใช่ app)
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});