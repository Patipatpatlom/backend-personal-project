import prisma from "../prisma/client.js";

console.log("PRISMA KEYS:", Object.keys(prisma));

/* =========================
   📦 CREATE ORDER
========================= */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address } = req.body;
    console.log(req.body)
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items 💀" });
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      if (!item.cakeId || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid item 💀" });
      }

      const cake = await prisma.cake.findUnique({
        where: { id: item.cakeId },
      });

      if (!cake) {
        return res.status(404).json({ message: "Cake not found 💀" });
      }

      totalPrice += cake.price * item.quantity;

      orderItemsData.push({
        cakeId: item.cakeId,
        quantity: item.quantity,
        price: cake.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        address: address || null,
        totalPrice,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Create order failed 💀",
      error: error.message,
    });
  }
};

/* =========================
   📦 GET ALL ORDERS (ADMIN)
========================= */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Get orders failed 💀" });
  }
};

/* =========================
   👤 GET MY ORDERS
========================= */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   🔥 UPDATE ORDER STATUS (ADMIN)
========================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedInput = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
      "WAITING",
      "SUCCESS",
    ];

    const upperStatus = (status || "").toUpperCase();

    if (!allowedInput.includes(upperStatus)) {
      return res.status(400).json({ message: "Invalid status 💀" });
    }

    // 🎯 Map input statuses to actual DB enum values defined in schema.prisma
    const statusMap = {
      PENDING: "PENDING",
      PAID: "PENDING",
      SHIPPED: "WAITING",
      WAITING: "WAITING",
      COMPLETED: "SUCCESS",
      SUCCESS: "SUCCESS",
      CANCELLED: "PENDING", // Fallback to PENDING as CANCELLED is not in db Status enum
    };

    const dbStatus = statusMap[upperStatus] || "PENDING";

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found 💀" });
    }

    const updated = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: dbStatus },
    });

    // ⚡ Broadcast order status update in real-time to all connected users
    const io = req.app.get("io");
    if (io) {
      io.emit("ORDER_STATUS_UPDATED", {
        orderId: Number(orderId),
        status: dbStatus,
      });
      console.log(`⚡ WebSocket: Broadcasted status change of Order #${orderId} to ${dbStatus}`);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Update status failed 💀",
      error: error.message,
    });
  }
};