import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCartPlus,
  FaWhatsapp,
  FaHeart,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { Commet } from "react-loading-indicators";
import axios from "axios";
import toast from "react-hot-toast";
import GoBack from "../components/GoBack";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SingleProduct = ({ setShowAuth }) => {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [categoryId, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/products/${categoryId}/${productId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Product not found");
      }

      setProduct(data);
    } catch (error) {
      console.error("PRODUCT FETCH ERROR:", error);
      toast.error(error.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/reviews/product/${productId}?categoryId=${categoryId}`
      );

      setReviews(res.data.reviews || []);
      setReviewStats({
        averageRating: res.data.averageRating || 0,
        totalReviews: res.data.totalReviews || 0,
      });
    } catch (error) {
      console.error("REVIEWS FETCH ERROR:", error.response?.data || error);
    }
  };

  const availableStock = Number(product?.available ?? 0);
  const isOutOfStock = availableStock <= 0;

  const actualCategoryId = Number(
    product?.category?.category_id ??
      product?.categoryId ??
      product?.category_id ??
      categoryId
  );

  const currentRating = Number(reviewStats.averageRating || 0);

  const renderStars = (value = currentRating) => {
    const rounded = Math.round(Number(value || 0));

    return Array.from({ length: 5 }).map((_, index) =>
      index < rounded ? (
        <FaStar key={index} className="text-yellow-500" />
      ) : (
        <FaRegStar key={index} className="text-yellow-500" />
      )
    );
  };

  const requireLogin = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setShowAuth(true);
      return null;
    }

    return user;
  };

  const handlePlaceOrder = async () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    const user = requireLogin();
    if (!user) return;

    try {
      const res = await axios.post(`${API_URL}/api/auth/check-user`, {
        email: user.email,
      });

      if (!res.data.active) {
        setShowAuth(true);
        return;
      }

      navigate(`/payment/${actualCategoryId}/${productId}`);
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error.response?.data || error);
      toast.error("Server error");
    }
  };

  const handleCart = async () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    const user = requireLogin();
    if (!user) return;

    if (!actualCategoryId) {
      toast.error("Category ID is missing");
      console.log("CATEGORY ERROR:", { categoryId, product });
      return;
    }

    try {
      const cartData = {
        userId: user._id,
        productId: product.product_id,
        categoryId: actualCategoryId,
        productName: product.name,
        productImage: product.image,
        pricePerDay: product.pricePerDay,
      };

      console.log("CART SEND DATA:", cartData);

      const res = await axios.post(`${API_URL}/api/cart`, cartData);

      toast.success(res.data.message || "Product added to cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("ADD CART ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add cart"
      );
    }
  };

  const handleWishlist = async () => {
    const user = requireLogin();
    if (!user) return;

    if (!actualCategoryId) {
      toast.error("Category ID is missing");
      console.log("CATEGORY ERROR:", { categoryId, product });
      return;
    }

    try {
      const wishlistData = {
        userId: user._id,
        productId: product.product_id,
        categoryId: actualCategoryId,
        productName: product.name,
        productImage: product.image,
        pricePerDay: product.pricePerDay,
      };

      console.log("WISHLIST SEND DATA:", wishlistData);

      const res = await axios.post(
        `${API_URL}/api/wishlist`,
        wishlistData
      );

      toast.success(res.data.message || "Added to wishlist");
    } catch (error) {
      console.error("WISHLIST ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add wishlist"
      );
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = "94741287118";

    const message = `
Hello QuickRent,

I would like to inquire about this product.

Product ID: ${product.product_id}
Category ID: ${actualCategoryId}
Product Name: ${product.name}
Price Per Day: Rs. ${product.pricePerDay}
Available Stock: ${availableStock}

Please provide more details.
`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <Commet color={["#7a511d", "#a36c27", "#cc8731", "#d79f59"]} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <GoBack />

      {/* Top Section: Image | Product Details | Order Card */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6">
        {/* Image Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={`${API_URL}${product.image}`}
            alt={product.name}
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* Product Details Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-lg p-6 sm:p-8 min-h-[420px]">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-sm text-gray-400">
                Product ID: {product.product_id}
              </p>

              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
            </div>

            <span
              className={`px-4 py-1 rounded-full text-xs lg:text-sm font-semibold ${
                isOutOfStock
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isOutOfStock ? "Out of stock" : "In stock"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <div className="flex gap-1">{renderStars()}</div>

            <p className="text-sm text-gray-500">
              {reviewStats.totalReviews > 0
                ? `${reviewStats.averageRating} rating • ${reviewStats.totalReviews} reviews`
                : "No ratings yet"}
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed mt-6 line-clamp-5">
            {product.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500">Available stock</p>

              <p
                className={`text-2xl font-bold mt-1 ${
                  isOutOfStock ? "text-red-600" : "text-green-700"
                }`}
              >
                {availableStock}
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500">Price per day</p>

              <p className="text-2xl font-bold mt-1">
                Rs. {product.pricePerDay}
              </p>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 sm:p-8 min-h-[420px]">
          <p className="text-sm text-gray-500">Price per day</p>

          <p className="text-4xl font-bold text-gray-900 mt-2">
            Rs. {product.pricePerDay}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              onClick={handleWishlist}
              className="border rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
              <FaHeart /> Wish
            </button>

            <button
              onClick={handleCart}
              disabled={isOutOfStock}
              className={`rounded-xl py-3 flex items-center justify-center gap-2 transition ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-mainbtn hover:scale-[1.02]"
              }`}
            >
              <FaCartPlus /> Cart
            </button>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isOutOfStock}
            className={`w-full mt-6 py-4 rounded-xl text-lg font-semibold transition ${
              isOutOfStock
                ? "bg-red-100 text-red-600 cursor-not-allowed"
                : "bg-mainbtn hover:scale-[1.02]"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : "Place Order"}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <FaWhatsapp size={22} /> For enquiry
          </button>

          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Category ID</p>
            <p className="font-semibold text-gray-900 mt-1">
              {actualCategoryId}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Reviews | Payment Conditions */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6">
        {/* Reviews */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>

            <p className="text-sm text-gray-500">
              {reviewStats.totalReviews} customer reviews
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border rounded-xl p-4">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.userName}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900">No reviews yet</p>

                  <div className="flex gap-1">
                    {renderStars(0)}
                  </div>
                </div>

                <p className="text-gray-600 mt-3">
                  Reviews will appear here after customers complete their booking and submit feedback.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Conditions */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Ways & Conditions
          </h2>

          <div className="mt-6 space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Onsite Payment
              </h3>

              <p className="text-gray-600 mt-2 leading-relaxed">
                You can place the order online and select onsite payment. The order will be cancelled within 3 hours if it is not confirmed.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Advance Payment
              </h3>

              <p className="text-gray-600 mt-2 leading-relaxed">
                You can place the order online and select advance payment. 30% of the total amount must be paid online as an advance.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Need support?</p>

              <p className="font-semibold text-gray-900 mt-1">
                Contact us before placing the order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
