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
  const days = Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;

  return days;
};

const checkAvailability = async (req, res) => {
  try {
    const { productId, categoryId, startDate, endDate } = req.body;

    const rentalDays = calculateRentalDays(startDate, endDate);
    if (rentalDays <= 0) {
      return res.status(400).json({ available: false, message: "Invalid date range" });
    }

    const existing = await Booking.findOne({
      productId,
      categoryId: Number(categoryId),
      bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    res.json({ available: !existing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Availability check failed" });
  }
};

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const data = req.body;

    const product = await Product.findOne({
      product_id: data.productId,
      category_id: Number(data.categoryId),
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }

    const quantity = Math.max(Number(data.quantity || 1), 1);

    if (Number(product.available || 0) < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const days = calculateRentalDays(data.startDate, data.endDate);

    if (days <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "End date must be on or after start date" });
    }

    const totalAmount = Number(data.totalAmount || product.pricePerDay * quantity * days);
    const paymentMethod = data.paymentMethod || "On Site";
    const advancePaid = paymentMethod === "Advance" ? Number(data.advancePaid || totalAmount * 0.5) : 0;
    const bookingReference = data.bookingReference || `QR-${Date.now()}`;

    const booking = await Booking.create(
      [
        {
          categoryId: Number(data.categoryId),
          productId: data.productId,
          productName: data.productName,
          productImage: data.productImage,
          customerName: data.customerName,
          gmail: String(data.gmail || "").toLowerCase().trim(),
          contactNumber: data.contactNumber,
          nic: data.nic,
          province: data.province,
          city: data.city,
          address: data.address,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          quantity,
          days,
          totalAmount,
          paymentMethod,
          paymentStatus: data.paymentStatus || "Pending",
          bookingStatus: "Pending",
          advancePaid,
          balancePaid: false,
          transactionId: data.transactionId || "",
          bookingReference,
        },
      ],
      { session }
    );

    await Product.findOneAndUpdate(
      {
        product_id: data.productId,
        category_id: Number(data.categoryId),
      },
      { $inc: { available: -quantity } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: booking[0],
      bookingReference,
      totalAmount,
      paymentMethod,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: error.message || "Booking creation failed" });
  } finally {
    session.endSession();
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { productId, categoryId, quantity } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (["Cancelled", "Expired", "Returned"].includes(booking.bookingStatus)) {
      return res.status(400).json({ message: "Booking is already closed" });
    }

    const product = await Product.findOne({
      product_id: productId,
      category_id: Number(categoryId),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!booking.autoStockReleased) {
      product.available += Number(quantity || booking.quantity || 0);
      await product.save();
    }

    booking.bookingStatus = "Cancelled";
    booking.paymentStatus = "Cancelled";
    booking.autoStockReleased = true;
    booking.stockReleasedAt = new Date();
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { checkAvailability, createBooking };
