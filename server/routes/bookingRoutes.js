const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/Booking");
const Product = require("../models/Product");


const {
  checkAvailability,
  createBooking
} = require("../controllers/bookingController");

// Check Availability
router.post("/check-availability", checkAvailability);

// Create Booking
router.post("/", createBooking);

//cancel booking


// Get User Bookings
router.get("/user/:email", async (req, res) => {
  try {
    const bookings = await Booking.find({ gmail: req.params.email })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Cancel Booking + Restore Stock
router.put("/cancel/:bookingId", async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const booking = await Booking.findById(req.params.bookingId).session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (["Cancelled", "Expired", "Returned"].includes(booking.bookingStatus)) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Booking is already closed"
            });
        }

        // Restore product quantity
        const product = await Product.findOne({
            product_id: booking.productId,
            category_id: booking.categoryId
        }).session(session);

        if (!product) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (!booking.autoStockReleased) {
            product.available += booking.quantity;
            await product.save({ session });
        }

        // Update booking status
        booking.bookingStatus = "Cancelled";
        booking.paymentStatus = "Cancelled";
        booking.autoStockReleased = true;
        booking.stockReleasedAt = new Date();
        await booking.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully."
        });

    } catch (err) {

        await session.abortTransaction();
        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    } finally {

        session.endSession();

    }
});

module.exports = router;