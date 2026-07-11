const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");

router.use(adminAuth);

const cleanStatus = (value) => String(value || "Pending").toLowerCase();
const isPaid = (value) => cleanStatus(value) === "paid";
const isAdvance = (booking) => {
  const method = String(booking.paymentMethod || "").toLowerCase();
  const total = Number(booking.totalAmount || 0);
  const advance = Number(booking.advancePaid || 0);
  return method.includes("advance") || (advance > 0 && advance < total);
};
const isCancelled = (booking) => ["cancelled", "failed"].includes(cleanStatus(booking.bookingStatus)) || ["cancelled", "failed"].includes(cleanStatus(booking.paymentStatus));

const sum = (items, getter) => items.reduce((total, item) => total + Number(getter(item) || 0), 0);

const getMonthKey = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (key) => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en", { month: "long", year: "numeric" });
};

const getDaysInMonth = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

const getGroupKey = (booking) => booking.bookingReference || String(booking._id);

const getBalanceAmount = (booking) => {
  if (isCancelled(booking) || booking.bookingStatus === "Returned") return 0;

  const total = Number(booking.totalAmount || 0);
  const advance = Number(booking.advancePaid || 0);

  if (booking.balancePaid) return 0;
  if (isAdvance(booking)) return Math.max(total - advance, 0);
  return isPaid(booking.paymentStatus) ? 0 : total;
};

const getCollectedAmount = (booking) => {
  if (isCancelled(booking)) return 0;

  const total = Number(booking.totalAmount || 0);
  const advance = Number(booking.advancePaid || 0);
  const damageCharge = Number(booking.damageCharge || 0);

  if (isAdvance(booking)) {
    const balance = Math.max(total - advance, 0);
    return advance + (booking.balancePaid ? balance : 0) + damageCharge;
  }

  return isPaid(booking.paymentStatus) ? total + damageCharge : damageCharge;
};

const getPaymentLabel = (booking) => {
  if (isCancelled(booking)) return "Cancelled";

  if (booking.balancePaid) return "Paid";

  if (isAdvance(booking)) {
    return "Balance Pending";
  }

  return isPaid(booking.paymentStatus) ? "Paid" : "Pending";
};

const groupBookings = (bookings) => {
  const map = new Map();

  bookings.forEach((bookingDoc) => {
    const booking = bookingDoc.toObject ? bookingDoc.toObject() : bookingDoc;
    const key = getGroupKey(booking);
    const existing = map.get(key) || {
      groupKey: key,
      bookingReference: booking.bookingReference || key,
      customerName: booking.customerName,
      gmail: booking.gmail,
      contactNumber: booking.contactNumber,
      nic: booking.nic,
      province: booking.province,
      city: booking.city,
      address: booking.address,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      paymentMethod: booking.paymentMethod,
      bookingStatus: booking.bookingStatus || "Pending",
      paymentStatus: booking.paymentStatus || "Pending",
      totalAmount: 0,
      advancePaid: 0,
      balanceAmount: 0,
      collectedAmount: 0,
      damageCharge: 0,
      items: [],
    };

    existing.totalAmount += Number(booking.totalAmount || 0);
    existing.advancePaid += Number(booking.advancePaid || 0);
    existing.balanceAmount += getBalanceAmount(booking);
    existing.collectedAmount += getCollectedAmount(booking);
    existing.damageCharge += Number(booking.damageCharge || 0);

    // Group status is calculated after all items are collected.

    existing.items.push({
      _id: booking._id,
      categoryId: booking.categoryId,
      productId: booking.productId,
      productName: booking.productName,
      productImage: booking.productImage,
      quantity: booking.quantity,
      days: booking.days,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      balancePaid: booking.balancePaid || false,
      balancePaidAt: booking.balancePaidAt || null,
      returnItems: booking.returnItems || [],
      damageCharge: booking.damageCharge || 0,
    });

    map.set(key, existing);
  });

  return [...map.values()].map((group) => {
    const statuses = group.items.map((item) => cleanStatus(item.bookingStatus));
    const labels = group.items.map((item) => getPaymentLabel(item));

    let bookingStatus = "Pending";
    if (statuses.length && statuses.every((status) => status === "returned")) {
      bookingStatus = "Returned";
    } else if (statuses.length && statuses.every((status) => status === "cancelled" || status === "failed")) {
      bookingStatus = "Cancelled";
    } else if (statuses.some((status) => status === "confirmed")) {
      bookingStatus = "Confirmed";
    } else if (statuses.some((status) => status === "pending")) {
      bookingStatus = "Pending";
    } else if (statuses.some((status) => status === "returned")) {
      bookingStatus = "Returned";
    }

    const paymentLabel = labels.some((label) => label === "Balance Pending")
      ? "Balance Pending"
      : labels.length && labels.every((label) => label === "Cancelled")
        ? "Cancelled"
        : labels.length && labels.every((label) => ["Paid", "Fully Paid"].includes(label))
          ? "Paid"
          : "Pending";

    return {
      ...group,
      bookingStatus,
      paymentLabel,
      settlementStatus: group.balanceAmount <= 0 && ["Paid", "Cancelled"].includes(paymentLabel) ? "paid" : "pending",
    };
  });
};

const buildGroupQuery = (groupKey) => {
  const decodedKey = decodeURIComponent(String(groupKey || ""));

  if (mongoose.Types.ObjectId.isValid(decodedKey)) {
    return { $or: [{ bookingReference: decodedKey }, { _id: decodedKey }] };
  }

  return { bookingReference: decodedKey };
};

const findBookingsByGroup = async (groupKey) => Booking.find(buildGroupQuery(groupKey));

const buildRevenueMonths = (bookings) => {
  const keys = new Set();
  const now = new Date();

  for (let i = 0; i < 6; i += 1) {
    keys.add(getMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }

  bookings.forEach((booking) => keys.add(getMonthKey(booking.balancePaidAt || booking.updatedAt || booking.createdAt || booking.startDate)));

  return [...keys]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => ({ key, label: getMonthLabel(key) }));
};

const buildRevenueDaily = (bookings, monthKeys) => {
  const data = {};

  monthKeys.forEach((key) => {
    const days = getDaysInMonth(key);
    data[key] = Array.from({ length: days }, (_, index) => ({ label: String(index + 1), value: 0 }));
  });

  bookings.forEach((booking) => {
    const date = new Date(booking.balancePaidAt || booking.updatedAt || booking.createdAt || booking.startDate || Date.now());
    const key = getMonthKey(date);
    if (!data[key]) return;

    const dayIndex = date.getDate() - 1;
    data[key][dayIndex].value += getCollectedAmount(booking);
  });

  return data;
};

const buildOverviewData = async () => {
  const [bookings, products, users, categories] = await Promise.all([
    Booking.find().sort({ createdAt: -1 }).lean(),
    Product.find().sort({ category_id: 1, product_id: 1 }).lean(),
    User.find().select("-password").sort({ createdAt: -1 }).lean(),
    Category.find().sort({ category_id: 1 }).lean(),
  ]);

  const groups = groupBookings(bookings);
  const revenueMonths = buildRevenueMonths(bookings);
  const revenueDaily = buildRevenueDaily(bookings, revenueMonths.map((month) => month.key));

  const pendingBookings = groups.filter((group) => cleanStatus(group.bookingStatus) === "pending").length;
  const confirmedBookings = groups.filter((group) => cleanStatus(group.bookingStatus) === "confirmed").length;
  const returnedBookings = groups.filter((group) => cleanStatus(group.bookingStatus) === "returned").length;
  const cancelledBookings = groups.filter((group) => cleanStatus(group.bookingStatus) === "cancelled").length;

  const lowStockProducts = products.filter((product) => Number(product.available || 0) <= 2);

  return {
    stats: {
      totalRevenue: sum(bookings, getCollectedAmount),
      pendingPayment: sum(bookings, getBalanceAmount),
      totalBookingGroups: groups.length,
      totalBookings: bookings.length,
      pendingBookings,
      confirmedBookings,
      returnedBookings,
      cancelledBookings,
      totalProducts: products.length,
      totalUsers: users.length,
      totalCategories: categories.length,
      equipmentAvailable: sum(products, (product) => product.available),
      damagedStock: sum(products, (product) => product.damaged),
      lowStock: lowStockProducts.length,
    },
    revenueMonths,
    revenueDaily,
    recentBookingGroups: groups.slice(0, 8),
    lowStockProducts: lowStockProducts.slice(0, 8),
  };
};

router.get("/overview", async (req, res) => {
  try {
    const data = await buildOverviewData();
    res.json(data);
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ message: "Failed to load admin overview" });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Admin Bookings Error:", error);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

router.get("/bookings/grouped", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(groupBookings(bookings));
  } catch (error) {
    console.error("Admin Grouped Bookings Error:", error);
    res.status(500).json({ message: "Failed to load grouped bookings" });
  }
});

router.put("/bookings/groups/:groupKey/status", async (req, res) => {
  try {
    const { bookingStatus } = req.body;

    if (!["Pending", "Confirmed", "Returned", "Cancelled"].includes(bookingStatus)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const groupQuery = buildGroupQuery(req.params.groupKey);
    const bookings = await Booking.find(groupQuery).lean();

    if (!bookings.length) {
      return res.status(404).json({ message: "Booking group not found" });
    }

    if (bookingStatus === "Cancelled") {
      for (const booking of bookings) {
        if (booking.bookingStatus !== "Cancelled") {
          await Product.updateOne(
            { product_id: booking.productId, category_id: booking.categoryId },
            { $inc: { available: Number(booking.quantity || 0) } }
          );
        }
      }
    }

    await Booking.updateMany(groupQuery, { $set: { bookingStatus } }, { runValidators: false });

    const updated = await findBookingsByGroup(req.params.groupKey);
    res.json(groupBookings(updated)[0] || { success: true });
  } catch (error) {
    console.error("Admin Group Status Error:", error);
    res.status(500).json({ message: error.message || "Failed to update booking group" });
  }
});

router.put("/bookings/groups/:groupKey/settle", async (req, res) => {
  try {
    const groupQuery = buildGroupQuery(req.params.groupKey);
    const bookings = await Booking.find(groupQuery).lean();

    if (!bookings.length) {
      return res.status(404).json({ message: "Booking group not found" });
    }

    const now = new Date();

    await Booking.updateMany(
      groupQuery,
      {
        $set: {
          paymentStatus: "Paid",
          balancePaid: true,
          balancePaidAt: now,
        },
      },
      { runValidators: false }
    );

    const updated = await findBookingsByGroup(req.params.groupKey);
    res.json({
      success: true,
      message: "Payment marked as paid",
      group: groupBookings(updated)[0] || null,
    });
  } catch (error) {
    console.error("Admin Settle Error:", error);
    res.status(500).json({ message: error.message || "Failed to mark payment as paid" });
  }
});

router.post("/bookings/groups/:groupKey/return", async (req, res) => {
  try {
    const { items = [] } = req.body;
    const groupQuery = buildGroupQuery(req.params.groupKey);
    const bookings = await Booking.find(groupQuery).lean();

    if (!bookings.length) {
      return res.status(404).json({ message: "Booking group not found" });
    }

    const grouped = groupBookings(bookings)[0];

    if (!grouped) {
      return res.status(404).json({ message: "Booking group not found" });
    }

    if (grouped.bookingStatus !== "Confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be returned" });
    }

    if (grouped.settlementStatus !== "paid") {
      return res.status(400).json({ message: "Collect and mark the balance payment as paid before return" });
    }

    const rowsByBookingId = new Map(items.map((item) => [String(item.bookingId), item]));

    for (const booking of bookings) {
      if (booking.bookingStatus === "Returned") {
        return res.status(400).json({ message: `Booking ${booking.productName} is already returned` });
      }

      const row = rowsByBookingId.get(String(booking._id));
      if (!row) {
        return res.status(400).json({ message: `Return details missing for ${booking.productName}` });
      }

      const quantity = Number(booking.quantity || 0);
      const goodQty = Number(row.goodQty || 0);
      const damagedQty = Number(row.damagedQty || 0);
      const damageCost = Number(row.damageCost || 0);

      if (goodQty < 0 || damagedQty < 0 || goodQty + damagedQty !== quantity) {
        return res.status(400).json({ message: `Good + damaged quantity must equal ${quantity} for ${booking.productName}` });
      }

      if (damagedQty > 0 && !String(row.damageReason || "").trim()) {
        return res.status(400).json({ message: `Damage reason is required for ${booking.productName}` });
      }

      await Product.updateOne(
        { product_id: booking.productId, category_id: booking.categoryId },
        { $inc: { available: goodQty, damaged: damagedQty } }
      );

      await Booking.updateOne(
        { _id: booking._id },
        {
          $set: {
            bookingStatus: "Returned",
            returnedAt: new Date(),
            returnItems: [
              {
                productId: booking.productId,
                productName: booking.productName,
                quantity,
                goodQty,
                damagedQty,
                damageReason: row.damageReason || "",
                damageCost,
              },
            ],
            damageCharge: damageCost,
          },
        },
        { runValidators: false }
      );
    }

    const updated = await findBookingsByGroup(req.params.groupKey);
    res.json({ success: true, message: "Return confirmed", group: groupBookings(updated)[0] || null });
  } catch (error) {
    console.error("Admin Return Error:", error);
    res.status(500).json({ message: error.message || "Return process failed" });
  }
});

router.post("/bookings/on-site", async (req, res) => {
  try {
    const data = req.body;

    const product = data.productMongoId
      ? await Product.findById(data.productMongoId)
      : await Product.findOne({ product_id: data.productId, category_id: Number(data.categoryId) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const quantity = Math.max(Number(data.quantity || 1), 1);

    if (Number(product.available || 0) < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.max(Number(data.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1), 1);
    const totalAmount = Number(data.totalAmount || product.pricePerDay * quantity * days);

    const booking = await Booking.create({
      categoryId: Number(product.category_id),
      productId: product.product_id,
      productName: product.name,
      productImage: product.image || "no-image.png",
      customerName: data.customerName,
      gmail: String(data.gmail || "onsite@quickrent.local").toLowerCase().trim(),
      contactNumber: data.contactNumber,
      nic: data.nic,
      province: data.province || "On Site",
      city: data.city || "On Site",
      address: data.address || "On Site booking",
      startDate,
      endDate,
      quantity,
      days,
      totalAmount,
      paymentMethod: "On Site",
      paymentStatus: "Pending",
      bookingStatus: "Pending",
      bookingReference: `QR-ONSITE-${Date.now()}`,
    });

    await Product.updateOne({ _id: product._id }, { $inc: { available: -quantity } });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Admin On Site Booking Error:", error);
    res.status(500).json({ message: error.message || "Failed to create on site booking" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ category_id: 1, product_id: 1 });
    res.json(products);
  } catch (error) {
    console.error("Admin Products Error:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = req.body;
    const product = await Product.create({
      product_id: body.product_id || `QR-${Date.now()}`,
      name: body.name,
      description: body.description || "No description added",
      pricePerDay: Number(body.pricePerDay || 0),
      category_id: Number(body.category_id),
      image: body.image || "",
      available: Number(body.available || 0),
      damaged: Number(body.damaged || 0),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Admin Product Create Error:", error);
    res.status(500).json({ message: error.message || "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const body = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        product_id: body.product_id,
        name: body.name,
        description: body.description || "No description added",
        pricePerDay: Number(body.pricePerDay || 0),
        category_id: Number(body.category_id),
        image: body.image || "",
        available: Number(body.available || 0),
        damaged: Number(body.damaged || 0),
      },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Admin Product Update Error:", error);
    res.status(500).json({ message: error.message || "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Admin Product Delete Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ category_id: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Admin Categories Error:", error);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const lastCategory = await Category.findOne().sort({ category_id: -1 });
    const category = await Category.create({
      category_id: Number(req.body.category_id || (lastCategory ? lastCategory.category_id + 1 : 1)),
      name: req.body.name,
      description: req.body.description || "",
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Admin Category Create Error:", error);
    res.status(500).json({ message: error.message || "Failed to create category" });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { category_id: Number(req.body.category_id), name: req.body.name, description: req.body.description || "" },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    console.error("Admin Category Update Error:", error);
    res.status(500).json({ message: error.message || "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Admin Category Delete Error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Admin User Role Error:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
});

module.exports = router;
