const Booking = require("../models/Booking");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const checkAvailability = async (req, res) => {
  try {
    const { productId, categoryId, startDate, endDate } = req.body;

    const existing = await Booking.findOne({
      productId,
      categoryId,
      bookingStatus: { $in: ["Pending", "Confirmed"] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
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
      category_id: data.categoryId,
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.available < data.quantity) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const booking = await Booking.create([{
      categoryId: data.categoryId,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      customerName: data.customerName,
      gmail: data.gmail,
      contactNumber: data.contactNumber,
      nic: data.nic,
      province: data.province,
      city: data.city,
      address: data.address,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      quantity: data.quantity,
      days: data.days,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || "Pending",
      bookingReference: `QR-${Date.now()}`
    }], { session });

    await Product.findOneAndUpdate(
      { product_id: data.productId,
        category_id: data.categoryId
      },
      { $inc: { available: -data.quantity } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: booking[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Booking creation failed" });
  } finally {
    session.endSession();
  }
};

exports.cancelBooking = async (req, res) => {
    try {

        const { bookingId } = req.params;
        const { productId, categoryId, quantity } = req.body;

        // Find booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.bookingStatus === "Cancelled") {
            return res.status(400).json({
                message: "Booking already cancelled"
            });
        }

        // Find the product
        const product = await Product.findOne({
            product_id: productId,
            category_id: categoryId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Increase available quantity
        product.available += Number(quantity);
        await product.save();

        // Update booking status
        booking.bookingStatus = "Cancelled";
        await booking.save();

        res.status(200).json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = { checkAvailability, createBooking };