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

  const safeText = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const money = (value) => {
    const amount = Number(value || 0);
    return `Rs. ${amount.toLocaleString("en-LK")}`;
  };

  const shortDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

      const res = await axios.get(`${API_URL}/api/bookings/user/${user.email}`);

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

  const openPrintWindow = (title, bodyHtml) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups to print the receipt.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeText(title)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              margin: 32px;
            }

            h1, h2, h3 {
              margin: 0 0 10px;
            }

            .muted {
              color: #6b7280;
              font-size: 12px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 24px;
              margin: 18px 0;
            }

            .line {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              border-bottom: 1px solid #e5e7eb;
              padding: 8px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 18px;
            }

            th, td {
              border-bottom: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            th {
              background: #f3f4f6;
            }

            .total {
              margin-top: 18px;
              max-width: 360px;
              margin-left: auto;
            }

            .brand {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f3466;
              padding-bottom: 14px;
              margin-bottom: 18px;
            }

            .print-note {
              margin-top: 28px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }

            .note-box {
              margin-top: 22px;
              padding: 14px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              background: #f9fafb;
            }

            @media print {
              button {
                display: none;
              }

              body {
                margin: 20px;
              }
            }
          </style>
        </head>

        <body>
          <button
            onclick="window.print()"
            style="padding:10px 16px;margin-bottom:16px;background:#0f3466;color:white;border:0;border-radius:8px;cursor:pointer;"
          >
            Print
          </button>

          ${bodyHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  const printBooking = (booking) => {
    const quantity = Number(booking.quantity || 1);
    const days = Number(booking.days || 1);
    const totalAmount = Number(booking.totalAmount || 0);

    const ratePerDay =
      Number(booking.pricePerDay || 0) ||
      Math.round(totalAmount / Math.max(quantity * days, 1));

    const advancePaid = Number(booking.advancePaid || 0);

    const balanceAmount =
      booking.balanceAmount !== undefined
        ? Number(booking.balanceAmount || 0)
        : Math.max(totalAmount - advancePaid, 0);

    const rows = `
      <tr>
        <td>${safeText(booking.productName)}</td>
        <td>${safeText(booking.productId || booking.product_id || "-")}</td>
        <td>${safeText(quantity)}</td>
        <td>${safeText(days)}</td>
        <td>${money(ratePerDay)}</td>
        <td>${money(totalAmount)}</td>
      </tr>
    `;

    openPrintWindow(
      `QuickRent Receipt ${booking.bookingReference || booking._id}`,
      `
        <div class="brand">
          <div>
            <h1>QuickRent</h1>
            <p class="muted">Rental booking receipt</p>
          </div>

          <div style="text-align:right">
            <h3>${safeText(booking.bookingReference || booking._id)}</h3>
            <p class="muted">Printed: ${new Date().toLocaleString("en-LK")}</p>
          </div>
        </div>

        <div class="grid">
          <div><strong>Customer:</strong> ${safeText(booking.customerName)}</div>
          <div><strong>Email:</strong> ${safeText(booking.gmail)}</div>

          <div><strong>Contact:</strong> ${safeText(booking.contactNumber)}</div>
          <div><strong>NIC:</strong> ${safeText(booking.nic || "-")}</div>

          <div><strong>Start:</strong> ${shortDate(booking.startDate)}</div>
          <div><strong>End:</strong> ${shortDate(booking.endDate)}</div>

          <div><strong>Booking Date:</strong> ${shortDate(booking.createdAt)}</div>
          <div><strong>Rental Days:</strong> ${safeText(days)}</div>

          <div style="grid-column:1 / -1">
            <strong>Address:</strong>
            ${safeText(booking.address || "")}
            ${booking.city ? `, ${safeText(booking.city)}` : ""}
            ${booking.province ? `, ${safeText(booking.province)}` : ""}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>ID</th>
              <th>Qty</th>
              <th>Days</th>
              <th>Rate / Day</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="total">
          <div class="line">
            <span>Total</span>
            <strong>${money(totalAmount)}</strong>
          </div>

          <div class="line">
            <span>Advance Paid</span>
            <strong>${money(advancePaid)}</strong>
          </div>

          <div class="line">
            <span>Balance</span>
            <strong>${money(balanceAmount)}</strong>
          </div>

          <div class="line">
            <span>Payment Method</span>
            <strong>${safeText(booking.paymentMethod || "-")}</strong>
          </div>

          <div class="line">
            <span>Payment Status</span>
            <strong>${safeText(booking.paymentStatus || "Pending")}</strong>
          </div>

          <div class="line">
            <span>Booking Status</span>
            <strong>${safeText(booking.bookingStatus || "-")}</strong>
          </div>
        </div>

        <div class="note-box">
          <h3>Important Note</h3>
          <p class="muted">
            Please keep this receipt for booking confirmation, product handover, payment verification, and return process.
          </p>
        </div>

        <p class="print-note">
          This receipt was generated from the QuickRent user account.
        </p>
      `
    );
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
    return (
      <p className="text-center text-gray-500 py-10">
        Please login to view bookings.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">My Bookings</h2>
        <p className="text-gray-500">{bookings.length} bookings</p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          You have no bookings yet.
        </p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border rounded-2xl p-5 hover:shadow-md transition"
            >
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
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>

                    <p className="text-xl font-bold mt-3">
                      Rs. {booking.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="md:text-right space-y-2">
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${statusClass(
                      booking.bookingStatus
                    )}`}
                  >
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

                {cleanStatus(booking.bookingStatus) === "pending" && (
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