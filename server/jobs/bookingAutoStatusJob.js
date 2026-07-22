const Booking = require("../models/Booking");
const Product = require("../models/Product");

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every 1 hour
const SRI_LANKA_OFFSET = "+05:30";

let running = false;
let started = false;

const getColomboTodayStart = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(`${values.year}-${values.month}-${values.day}T00:00:00${SRI_LANKA_OFFSET}`);
};

const releaseStockForBooking = async (booking) => {
  if (booking.autoStockReleased) return false;

  const quantity = Number(booking.quantity || 0);
  if (quantity <= 0) return false;

  await Product.updateOne(
    {
      product_id: booking.productId,
      category_id: Number(booking.categoryId),
    },
    { $inc: { available: quantity } }
  );

  return true;
};

const expirePendingOnSiteBookings = async (todayStart) => {
  const candidates = await Booking.find({
    bookingStatus: "Pending",
    paymentMethod: "On Site",
    paymentStatus: { $ne: "Paid" },
    endDate: { $lt: todayStart },
  }).lean();

  let expiredCount = 0;

  for (const booking of candidates) {
    const now = new Date();

    try {
      const stockReleased = await releaseStockForBooking(booking);

      await Booking.updateOne(
        { _id: booking._id, bookingStatus: "Pending" },
        {
          $set: {
            bookingStatus: "Expired",
            paymentStatus: "Expired",
            autoStatusReason: "Customer did not collect the product before the booking date ended.",
            expiredAt: now,
            autoStockReleased: booking.autoStockReleased || stockReleased,
            stockReleasedAt: booking.stockReleasedAt || (stockReleased ? now : null),
          },
        },
        { runValidators: false }
      );

      expiredCount += 1;
    } catch (error) {
      console.error(`AUTO EXPIRE ERROR for booking ${booking._id}:`, error.message);
    }
  }

  return expiredCount;
};

const markConfirmedBookingsOverdue = async (todayStart) => {
  const result = await Booking.updateMany(
    {
      bookingStatus: "Confirmed",
      endDate: { $lt: todayStart },
    },
    {
      $set: {
        bookingStatus: "Overdue",
        autoStatusReason: "Customer has not returned the product after the booking end date.",
        overdueAt: new Date(),
      },
    },
    { runValidators: false }
  );

  return result.modifiedCount || 0;
};

const autoUpdateBookingStatuses = async () => {
  if (running) return;

  running = true;

  try {
    const todayStart = getColomboTodayStart();

    const expiredCount = await expirePendingOnSiteBookings(todayStart);
    const overdueCount = await markConfirmedBookingsOverdue(todayStart);

    console.log(
      `[booking-auto-status] checked. expired=${expiredCount}, overdue=${overdueCount}`
    );
  } catch (error) {
    console.error("AUTO BOOKING STATUS ERROR:", error.message);
  } finally {
    running = false;
  }
};

const startBookingAutoStatusJob = () => {
  if (started) return;
  started = true;

  autoUpdateBookingStatuses();
  setInterval(autoUpdateBookingStatuses, CHECK_INTERVAL_MS);

  console.log("Booking auto-status job started. It checks expired and overdue bookings every hour.");
};

module.exports = startBookingAutoStatusJob;
module.exports.autoUpdateBookingStatuses = autoUpdateBookingStatuses;
