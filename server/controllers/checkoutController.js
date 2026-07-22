const Cart = require("../models/Cart");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const ACTIVE_BOOKING_STATUSES = ["Pending", "Confirmed", "Overdue"];

const getDateParts = (value) => {
  const raw = String(value || "").slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return null;
  return { year, month, day };
};

const calculateRentalDays = (startValue, endValue) => {
  const start = getDateParts(startValue);
  const end = getDateParts(endValue);

  if (!start || !end) return 0;

  const startTime = Date.UTC(start.year, start.month - 1, start.day);
  const endTime = Date.UTC(end.year, end.month - 1, end.day);
  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
};

exports.checkCartAvailability = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.body;
    const cart = await Cart.find({ userId });

    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart empty" });
    }

    const days = calculateRentalDays(startDate, endDate);
    if (days <= 0) {
      return res.status(400).json({ success: false, available: false, message: "Invalid date range" });
    }

    const unavailable = [];

    for (const item of cart) {
      const product = await Product.findOne({ product_id: item.productId, category_id: Number(item.categoryId) });
      if (!product || Number(product.available || 0) < Number(item.quantity || 1)) {
        unavailable.push({ productName: item.productName, reason: "Stock issue" });
      }

      const overlap = await Booking.findOne({
        productId: item.productId,
        categoryId: Number(item.categoryId),
        bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
        $or: [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
          },
        ],
      });

      if (overlap) unavailable.push({ productName: item.productName, reason: "Date overlap" });
    }

    if (unavailable.length > 0) {
      return res.json({ success: false, available: false, unavailableItems: unavailable });
    }

    res.json({ success: true, available: true });
  } catch (err) {
    next(err);
  }
};

exports.confirmCheckout = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, bookingData, paymentMethod, paymentStatus = "Pending", transactionId = "" } = req.body;

    const cartItems = await Cart.find({ userId }).session(session);

    if (cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cart empty" });
    }

    const days = calculateRentalDays(bookingData.startDate, bookingData.endDate);

    if (days <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "End date must be on or after start date" });
    }

    const bookings = [];
    const bookingReference = `QR-${Date.now()}`;

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);

    for (const item of cartItems) {
      const quantity = Math.max(Number(item.quantity || 1), 1);
      const totalAmount = Number(item.pricePerDay || 0) * quantity * days;
      const advancePaid = paymentMethod === "Advance" ? totalAmount * 0.5 : 0;

      const product = await Product.findOne({
        product_id: item.productId,
        category_id: Number(item.categoryId),
      }).session(session);

      if (!product || Number(product.available || 0) < quantity) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `${item.productName} does not have enough stock` });
      }

      const booking = new Booking({
        categoryId: item.categoryId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,

        customerName: bookingData.customerName,
        gmail: String(bookingData.gmail || "").toLowerCase().trim(),
        contactNumber: bookingData.contactNumber,
        nic: bookingData.nic,
        province: bookingData.province,
        city: bookingData.city,
        address: bookingData.address,

        startDate: start,
        endDate: end,
        quantity,
        days,
        totalAmount,

        paymentMethod,
        paymentStatus,
        transactionId,
        bookingReference,
        bookingStatus: "Pending",
        advancePaid,
        balancePaid: false,
      });

      await booking.save({ session });
      bookings.push(booking);

      await Product.findOneAndUpdate(
        {
          product_id: item.productId,
          category_id: Number(item.categoryId),
        },
        { $inc: { available: -quantity } },
        { session }
      );
    }

    await Cart.deleteMany({ userId }).session(session);
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Booking Successful",
      bookingReference,
      bookings,
      totalAmount: bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0),
      paymentMethod,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Checkout Error:", err);
    next(err);
  } finally {
    session.endSession();
  }
};
