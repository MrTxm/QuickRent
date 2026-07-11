const Review = require("../models/Review");
const Booking = require("../models/Booking");

const clean = (value) => String(value || "").trim().toLowerCase();

const isBookingReadyForReview = (booking) => {
  const bookingStatus = clean(booking.bookingStatus);
  const paymentStatus = clean(booking.paymentStatus);

  const isReturned = bookingStatus === "returned";
  const isPaid = paymentStatus === "paid" || booking.balancePaid === true;

  return isReturned && isPaid;
};

exports.createReview = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      bookingId,
      productId,
      categoryId,
      productName,
      productImage,
      rating,
      comment,
    } = req.body;

    if (!userId || !userEmail || !bookingId || !productId || categoryId === undefined || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required review fields",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (clean(booking.gmail) !== clean(userEmail)) {
      return res.status(403).json({
        success: false,
        message: "You can review only your own booking",
      });
    }

    if (booking.productId !== productId || Number(booking.categoryId) !== Number(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Review product does not match this booking",
      });
    }

    if (!isBookingReadyForReview(booking)) {
      return res.status(400).json({
        success: false,
        message: "You can review only after the booking is returned and payment is fully paid",
      });
    }

    const alreadyReviewed = await Review.findOne({ bookingId });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this booking",
      });
    }

    const review = await Review.create({
      userId,
      userName: userName || "QuickRent User",
      userEmail,
      bookingId,
      productId,
      categoryId: Number(categoryId),
      productName: productName || booking.productName,
      productImage: productImage || booking.productImage,
      rating: Number(rating),
      comment,
    });

    booking.reviewed = true;
    booking.reviewId = review._id;
    booking.reviewedAt = new Date();
    await booking.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this booking",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const categoryId = req.query.categoryId;

    const query = { productId };

    if (categoryId !== undefined && categoryId !== "") {
      query.categoryId = Number(categoryId);
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(1))
      : 0;

    res.json({
      success: true,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load reviews",
      error: error.message,
    });
  }
};

exports.getBookingReview = async (req, res) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId }).lean();
    res.json({ success: true, review });
  } catch (error) {
    console.error("Get Booking Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load booking review",
      error: error.message,
    });
  }
};
