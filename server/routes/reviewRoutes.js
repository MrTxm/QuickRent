const express = require("express");
const router = express.Router();

const {
  createReview,
  getProductReviews,
  getBookingReview,
} = require("../controllers/reviewController");

router.post("/", createReview);
router.get("/product/:productId", getProductReviews);
router.get("/booking/:bookingId", getBookingReview);

module.exports = router;
