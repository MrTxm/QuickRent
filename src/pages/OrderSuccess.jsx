import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome, FaClipboardList } from "react-icons/fa";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
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

  const bookingReference = state.bookingReference || "N/A";
  const totalAmount = state.totalAmount;
  const paymentMethod = state.paymentMethod;
  const productName = state.productName;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 px-6 sm:px-10 py-10 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-5xl" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold mt-6 text-gray-900">
              Booking Successful
            </h1>

            <p className="text-gray-600 mt-4 max-w-xl mx-auto">
              Thank you for choosing QuickRent. Your booking has been received successfully.
            </p>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Booking Reference
                </p>

                <h2 className="text-2xl font-bold mt-2 text-gray-900 break-all">
                  {bookingReference}
                </h2>
              </div>

              <div className="border rounded-2xl p-5 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Booking Status
                </p>

                <h2 className="text-2xl font-bold mt-2 text-green-600">
                  Pending Confirmation
                </h2>
              </div>

              {productName && (
                <div className="border rounded-2xl p-5 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Product
                  </p>

                  <h2 className="text-xl font-bold mt-2 text-gray-900">
                    {productName}
                  </h2>
                </div>
              )}

              {totalAmount && (
                <div className="border rounded-2xl p-5 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <h2 className="text-xl font-bold mt-2 text-gray-900">
                    Rs. {totalAmount}
                  </h2>
                </div>
              )}

              {paymentMethod && (
                <div className="border rounded-2xl p-5 bg-gray-50 sm:col-span-2">
                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <h2 className="text-xl font-bold mt-2 text-gray-900">
                    {paymentMethod}
                  </h2>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900">
                What happens next?
              </h3>

              <p className="text-blue-800 mt-2 leading-relaxed">
                Your booking is now saved in your account. You can view the booking status,
                print your receipt, or track updates from your profile.
              </p>
            </div>

            {/* Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => navigate("/profile")}
                className="bg-mainbtn px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] transition"
              >
                <FaClipboardList />
                View My Bookings
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