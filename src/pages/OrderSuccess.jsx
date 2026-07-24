import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaHome,
  FaClipboardList,
  FaPrint,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const safeText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

const shortDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getImageSrc = (image) => {
  if (!image) return "";
  if (String(image).startsWith("http") || String(image).startsWith("data:")) {
    return image;
  }
  return `${API_URL}${image}`;
};

const getSavedOrder = () => {
  try {
    return JSON.parse(localStorage.getItem("quickrent_last_order")) || null;
  } catch {
    return null;
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

  const paymentStatus = booking.paymentStatus || "Pending";
  const bookingStatus = booking.bookingStatus || "Pending";

  const rows = `
    <tr>
      <td>${safeText(booking.productName || "-")}</td>
      <td>${safeText(booking.productId || booking.product_id || "-")}</td>
      <td>${safeText(quantity)}</td>
      <td>${safeText(days)}</td>
      <td>${money(ratePerDay)}</td>
      <td>${money(totalAmount)}</td>
    </tr>
  `;

  openPrintWindow(
    `QuickRent Receipt ${booking.bookingReference || ""}`,
    `
      <div class="brand">
        <div>
          <h1>QuickRent</h1>
          <p class="muted">Rental booking receipt</p>
        </div>

        <div style="text-align:right">
          <h3>${safeText(booking.bookingReference || "N/A")}</h3>
          <p class="muted">Printed: ${new Date().toLocaleString("en-LK")}</p>
        </div>
      </div>

      <div class="grid">
        <div><strong>Customer:</strong> ${safeText(booking.customerName || "-")}</div>
        <div><strong>Payment Method:</strong> ${safeText(booking.paymentMethod || "-")}</div>
        <div><strong>Start Date:</strong> ${shortDate(booking.startDate)}</div>
        <div><strong>End Date:</strong> ${shortDate(booking.endDate)}</div>
        <div><strong>Booking Status:</strong> ${safeText(bookingStatus)}</div>
        <div><strong>Payment Status:</strong> ${safeText(paymentStatus)}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Product ID</th>
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
          <span>Total Amount</span>
          <strong>${money(totalAmount)}</strong>
        </div>

        <div class="line">
          <span>Advance Paid</span>
          <strong>${money(advancePaid)}</strong>
        </div>

        <div class="line">
          <span>Balance Amount</span>
          <strong>${money(balanceAmount)}</strong>
        </div>
      </div>

      <div class="note-box">
        <strong>Note:</strong>
        Please keep this booking reference number for product handover, payment confirmation, and return checking.
      </div>

      <p class="print-note">
        This receipt was generated from the QuickRent booking system.
      </p>
    `
  );
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const order = state || getSavedOrder();

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-3xl p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl text-red-600">!</span>
          </div>

          <h1 className="text-3xl font-bold mt-6 text-gray-900">
            No Order Found
          </h1>

          <p className="text-gray-500 mt-3">
            We could not find any booking details for this page.
          </p>

          <button
            onClick={() => navigate("/")}
            className="bg-mainbtn px-8 py-3 rounded-xl mt-8 font-semibold hover:scale-[1.02] transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const {
    bookingReference,
    customerName,
    productName,
    productImage,
    productId,
    quantity,
    days,
    startDate,
    endDate,
    totalAmount,
    paymentMethod,
    paymentStatus,
    bookingStatus,
    advancePaid,
  } = order;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-green-50 px-6 sm:px-10 py-10 text-center relative overflow-hidden">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-green-300 rounded-full opacity-30 animate-ping"></div>

            <div className="relative w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-5xl animate-bounce" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold mt-6 text-gray-900">
              Booking Successful
            </h1>

            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
              Your booking has been received successfully. Please keep your booking
              reference number for future use.
            </p>

            <div className="mt-6 inline-block bg-white border border-green-200 rounded-2xl px-6 py-4 shadow-sm">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <h2 className="text-3xl font-extrabold text-green-700 break-all">
                {bookingReference || "N/A"}
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Customer Name</p>
                <h2 className="text-xl font-bold mt-2 text-gray-900">
                  {customerName || "-"}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Booking Status</p>
                <h2 className="text-xl font-bold mt-2 text-green-600">
                  {bookingStatus || "Pending"}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50 sm:col-span-2">
                <p className="text-sm text-gray-500">Product</p>

                <div className="flex items-center gap-4 mt-3">
                  {productImage && (
                    <img
                      src={getImageSrc(productImage)}
                      alt={productName || "Product"}
                      className="w-20 h-20 object-cover rounded-xl border"
                    />
                  )}

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {productName || "-"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Product ID: {productId || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Quantity</p>
                <h2 className="text-xl font-bold mt-2 text-gray-900">
                  {quantity || 1}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Rental Days</p>
                <h2 className="text-xl font-bold mt-2 text-gray-900">
                  {days || 1}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Start Date</p>
                <h2 className="text-lg font-bold mt-2 text-gray-900">
                  {shortDate(startDate)}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">End Date</p>
                <h2 className="text-lg font-bold mt-2 text-gray-900">
                  {shortDate(endDate)}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Payment Method</p>
                <h2 className="text-xl font-bold mt-2 text-gray-900">
                  {paymentMethod || "-"}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">Payment Status</p>
                <h2 className="text-xl font-bold mt-2 text-gray-900">
                  {paymentStatus || "Pending"}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-900 sm:col-span-2">
                <p className="text-sm text-gray-300">Total Amount</p>
                <h2 className="text-3xl font-extrabold mt-2 text-green-400">
                  {money(totalAmount)}
                </h2>

                {Number(advancePaid || 0) > 0 && (
                  <p className="text-sm text-gray-300 mt-2">
                    Advance Paid: {money(advancePaid)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900">What happens next?</h3>

              <p className="text-blue-800 mt-2 leading-relaxed">
                Your booking is now saved in your account. The admin will check
                your booking and confirm the handover. You can view the booking
                status and print your booking details from your profile.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <button
                onClick={() => navigate("/profile")}
                className="bg-mainbtn px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] transition"
              >
                <FaClipboardList />
                My Bookings
              </button>

              <button
                onClick={() => printBooking(order)}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-green-700 transition"
              >
                <FaPrint />
                Print
              </button>

              <button
                onClick={() => navigate("/")}
                className="bg-gray-100 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-200 transition"
              >
                <FaHome />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;