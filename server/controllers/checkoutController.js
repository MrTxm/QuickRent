const Cart = require("../models/Cart");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.checkCartAvailability = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.body;
        const cart = await Cart.find({ userId });

        if (cart.length === 0) return res.status(400).json({ success: false, message: "Cart empty" });

        const unavailable = [];

        for (const item of cart) {
            const product = await Product.findOne({ product_id: item.productId });
            if (!product || product.available < item.quantity) {
                unavailable.push({ productName: item.productName, reason: "Stock issue" });
            }

            const overlap = await Booking.findOne({
                productId: item.productId,
                bookingStatus: { $in: ["Pending", "Confirmed"] },
                $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
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

        const bookings = [];
        const bookingReference = `QR-${Date.now()}`;

        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        for (const item of cartItems) {
            const totalAmount = (item.pricePerDay || 0) * (item.quantity || 1) * days;

            const booking = new Booking({
                categoryId: item.categoryId,
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,

                customerName: bookingData.customerName,
                gmail: bookingData.gmail,
                contactNumber: bookingData.contactNumber,
                nic: bookingData.nic,
                province: bookingData.province,
                city: bookingData.city,
                address: bookingData.address,

                startDate: start,
                endDate: end,
                quantity: item.quantity,
                days,
                totalAmount,

                paymentMethod,
                paymentStatus,
                transactionId,
                bookingReference,
                bookingStatus: "Pending"
            });

            await booking.save({ session });
            bookings.push(booking);

            // Reduce Stock - Correct way

            await Product.findOneAndUpdate(
                { 
                    product_id: item.productId, 
                    category_id: item.categoryId
                },
                { $inc: { available: -item.quantity } },
                { session }
            );
        }

        await Cart.deleteMany({ userId }).session(session);
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "Booking Successful",
            bookingReference,
            bookings
        });

    } catch (err) {
        await session.abortTransaction();
        console.error("Checkout Error:", err);
        next(err);
    } finally {
        session.endSession();
    }
};