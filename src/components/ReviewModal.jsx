import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const ReviewModal = ({ booking, user, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post("http://localhost:5000/api/reviews", {
        userId: user._id,
        userName: user.fullName || user.name || "QuickRent User",
        userEmail: user.email,
        bookingId: booking._id,
        productId: booking.productId,
        categoryId: booking.categoryId,
        productName: booking.productName,
        productImage: booking.productImage,
        rating,
        comment,
      });

      toast.success(res.data.message || "Review submitted");
      onSubmitted();
      onClose();
    } catch (error) {
      console.error("REVIEW SUBMIT ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Write Review</h2>
            <p className="text-gray-500 mt-1">{booking.productName}</p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-900"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={submitReview} className="mt-6">
          <label className="text-sm font-medium text-gray-600">Your rating</label>

          <div className="flex gap-2 mt-3 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-yellow-500 hover:scale-110 transition"
              >
                {star <= rating ? <FaStar /> : <FaRegStar />}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-600 mt-6">
            Your review
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="5"
            maxLength="800"
            placeholder="Share your experience with this rental item..."
            className="w-full mt-3 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <p className="text-xs text-gray-400 mt-1">{comment.length}/800</p>

          <button
            disabled={submitting}
            className="w-full mt-6 bg-mainbtn py-3 rounded-2xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
