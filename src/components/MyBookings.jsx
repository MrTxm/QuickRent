import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPrint, FaTrash, FaStar } from "react-icons/fa";
import ReviewModal from "./ReviewModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, []);

  const imageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  const cleanStatus = (value) => String(value || "").trim().toLowerCase();

  const canReview = (booking) => {
    const bookingStatus = cleanStatus(booking.bookingStatus);
    const paymentStatus = cleanStatus(booking.paymentStatus);

    return (
      bookingStatus === "returned" &&
      (paymentStatus === "paid" || booking.balancePaid === true) &&
      !booking.reviewed
    );
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/bookings/user/${user.email}`
      );
      setBookings(res.data);
    } catch (err) {
      console.error("FETCH BOOKINGS ERROR:", err.response?.data || err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.put(`${API_URL}/api/bookings/cancel/${bookingId}`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      console.error("CANCEL BOOKING ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const printBooking = (booking) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QuickRent Booking Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .receipt { max-width: 850px; margin: auto; }
          .header { text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; }
          h1 { color: #1e3a8a; }
          .info { display: flex; justify-content: space-between; gap: 30px; margin: 30px 0; }
          .product-img { width: 180px; height: 180px; object-fit: cover; border-radius: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          th, td { padding: 14px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f1f5f9; color: #1e40af; }
          .total { font-size: 24px; font-weight: bold; color: #1e3a8a; text-align: right; margin-top: 25px; }
          .footer { text-align: center; margin-top: 35px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>QuickRent</h1>
            <h2>Booking Receipt</h2>
            <p>Reference: <strong>${booking.bookingReference}</strong></p>
            <p>Date: ${new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="info">
            <div>
              <h3>Customer Details</h3>
              <p>${booking.customerName}</p>
              <p>${booking.gmail}</p>
              <p>${booking.contactNumber}</p>

              <h3>Booking Period</h3>
              <p>${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
              <p>Days: ${booking.days}</p>
            </div>

            <img src="${imageUrl(booking.productImage)}" class="product-img" />
          </div>

          <table>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Rate / Day</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>${booking.productName}</td>
              <td>${booking.quantity}</td>
              <td>Rs. ${booking.pricePerDay || Math.round(booking.totalAmount / booking.days)}</td>
              <td>Rs. ${booking.totalAmount}</td>
            </tr>
          </table>

          <div class="total">Total Amount: Rs. ${booking.totalAmount}</div>
          <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
          <p><strong>Booking Status:</strong> ${booking.bookingStatus}</p>

          <div class="footer">Thank you for choosing QuickRent.</div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const statusClass = (status) => {
    const value = cleanStatus(status);

    if (value === "pending") return "bg-yellow-100 text-yellow-700";
    if (value === "confirmed") return "bg-green-100 text-green-700";
    if (value === "returned") return "bg-blue-100 text-blue-700";
    if (value === "cancelled") return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return <p className="text-center text-xl">Loading your bookings...</p>;
  }

  if (!user) {
    return <p className="text-center text-gray-500 py-10">Please login to view bookings.</p>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">My Bookings</h2>
        <p className="text-gray-500">{bookings.length} bookings</p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500 py-10">You have no bookings yet.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="border rounded-2xl p-5 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row gap-5 md:items-start md:justify-between">
                <div className="flex gap-4">
                  <img
                    src={imageUrl(booking.productImage)}
                    className="w-28 h-28 rounded-2xl object-cover bg-gray-100"
                    alt={booking.productName}
                  />

                  <div>
                    <p className="font-mono text-sm text-gray-500">
                      Ref: {booking.bookingReference}
                    </p>

                    <h3 className="text-2xl font-semibold mt-1">
                      {booking.productName}
                    </h3>

                    <p className="text-gray-600 mt-2">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>

                    <p className="text-xl font-bold mt-3">
                      Rs. {booking.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="md:text-right space-y-2">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${statusClass(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>

                  <p className="text-sm text-gray-500">
                    Payment: {booking.paymentStatus || "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => printBooking(booking)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-xl transition"
                >
                  <FaPrint /> Print Receipt
                </button>

                {booking.bookingStatus === "Pending" && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition"
                  >
                    <FaTrash /> Cancel Booking
                  </button>
                )}

                {canReview(booking) && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex items-center gap-2 bg-mainbtn px-5 py-3 rounded-xl hover:scale-[1.02] transition"
                  >
                    <FaStar /> Write Review
                  </button>
                )}

                {booking.reviewed && (
                  <span className="flex items-center gap-2 bg-green-100 text-green-700 px-5 py-3 rounded-xl">
                    <FaStar /> Reviewed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          user={user}
          onClose={() => setSelectedBooking(null)}
          onSubmitted={fetchBookings}
        />
      )}
    </div>
  );
};

export default MyBookings;
