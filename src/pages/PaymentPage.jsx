import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import SavedAddressPicker from "../components/SavedAddressPicker";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const calculateRentalDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
    return 0;
  }

  const startTime = Date.UTC(startYear, startMonth - 1, startDay);
  const endTime = Date.UTC(endYear, endMonth - 1, endDay);

  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
};

const PaymentPage = () => {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [days, setDays] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockError, setStockError] = useState("");

  const loggedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [bookingData, setBookingData] = useState({
    customerName: loggedUser.fullName || "",
    gmail: loggedUser.email || "",
    contactNumber: loggedUser.contactNumber || "",
    nic: loggedUser.nic || "",
    province: loggedUser.province || "",
    city: loggedUser.city || "",
    address: loggedUser.address || "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/products/${categoryId}/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [categoryId, productId]);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSelectAddress = (address) => {
    setBookingData((prev) => ({
      ...prev,
      customerName: address.customerName || prev.customerName,
      contactNumber: address.contactNumber || prev.contactNumber,
      province: address.province || prev.province,
      city: address.city || prev.city,
      address: address.address || prev.address,
    }));
  };

  const totalAmount = product ? product.pricePerDay * quantity * days : 0;

  const changeQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    if (product && newQuantity > product.available) {
      setStockError(`Only ${product.available} units available`);
      return;
    }
    setQuantity(newQuantity);
    setStockError("");
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    setStockError("");

    if (!bookingData.customerName || !bookingData.gmail || !bookingData.contactNumber || 
        !bookingData.nic || !bookingData.startDate || !bookingData.endDate || 
        !bookingData.province || !bookingData.city || !bookingData.address) {
      alert("Please fill all fields.");
      return;
    }

    const bookingDays = calculateRentalDays(bookingData.startDate, bookingData.endDate);
    if (bookingDays <= 0) {
      alert("End date must be on or after start date.");
      return;
    }

    if (quantity > product.available) {
      setStockError(`Only ${product.available} available`);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/bookings/check-availability`, {
        productId,
        categoryId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
      });

      if (!response.data.available) {
        alert("Selected dates are already booked.");
        return;
      }

      setDays(bookingDays);
      setShowPopup(true);
    } catch (error) {
      console.log(error);
      alert("Server Error");
    }
  };

  const handleBooking = async (paymentMethod) => {
    try {
      const bookingReference = `QR-${Date.now()}`;

      const booking = {
        ...bookingData,
        categoryId,
        productId,
        productName: product.name,
        productImage: product.image,
        quantity,
        days,
        totalAmount,
        paymentMethod,
        bookingReference,
      };

      const res = await axios.post(`${API_URL}/api/bookings`, booking);
      toast.success(`Booking Successful!\nReference: ${res.data.bookingReference || bookingReference}`);
      setShowPopup(false);
      navigate(`/order-success/${res.data.bookingReference || bookingReference}`, {
        state: {
          bookingReference: res.data.bookingReference || bookingReference,
          totalAmount,
          paymentMethod,
          productName: product.name,
        },
      })
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error(error.response?.data?.message || "Booking Failed");
    }
  };

  const handleAdvancePayment = async () => {
    try {
      const amount = (product.pricePerDay * quantity * days * 0.5).toFixed(2);
      const bookingReference = `QR-${Date.now()}`;

      const res = await axios.post(`${API_URL}/api/payment/generate`, {
        orderId: bookingReference,
        amount,
        firstName: bookingData.customerName,
        lastName: "",
        email: bookingData.gmail,
        phone: bookingData.contactNumber,
        address: bookingData.address,
        city: bookingData.city,
      });

      const payment = res.data;

      window.payhere.onCompleted = async function (orderId) {
        try {
          await axios.post(`${API_URL}/api/bookings`, {
            ...bookingData,
            categoryId,
            productId,
            productName: product.name,
            productImage: product.image,
            quantity,
            days,
            totalAmount: product.pricePerDay * quantity * days,
            paymentMethod: "Advance",
            paymentStatus: "Paid",
            bookingStatus: "Pending",
            advancePaid: product.pricePerDay * quantity * days * 0.5,
            transactionId: orderId,
            bookingReference,
          });

          toast.success(`Booking Successful!\nReference: ${bookingReference}`);
          setShowPopup(false);
          navigate(`/order-success/${bookingReference}`, {
            state: {
              bookingReference,
              totalAmount: product.pricePerDay * quantity * days,
              paymentMethod: "Advance",
              productName: product.name,
            },
          });
        } catch (error) {
          toast.error("Booking save failed after payment");
        }
      };

      window.payhere.onDismissed = () => alert("Payment Cancelled");
      window.payhere.onError = (error) => alert("Payment Error");

      window.payhere.startPayment(payment);
    } catch (error) {
      console.log(error);
      toast.error("Payment initiation failed");
    }
  };

  if (loading) return <div className="text-center py-20">Loading product...</div>;

  return (
    <div className="max-w-8xl mx-auto mt-10 mb-10 shadow-xl rounded-3xl p-8 bg-white">
      <GoBack />

      <form onSubmit={handleProceed} className="space-y-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Complete Your Booking</h1>

        <SavedAddressPicker user={loggedUser} onSelect={handleSelectAddress} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="customerName" placeholder="Full Name" value={bookingData.customerName} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
          <input type="email" name="gmail" placeholder="Email Address" value={bookingData.gmail} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
          <input type="tel" name="contactNumber" placeholder="Contact Number" value={bookingData.contactNumber} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
          <input type="text" name="nic" placeholder="NIC Number" value={bookingData.nic} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input type="date" name="startDate" min={new Date().toISOString().split("T")[0]} value={bookingData.startDate} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input type="date" name="endDate" min={bookingData.startDate || new Date().toISOString().split("T")[0]} value={bookingData.endDate} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <select name="province" value={bookingData.province} onChange={handleChange} className="w-full border rounded-2xl p-4" required>
            <option value="">Select Province</option>
            <option>Western Province</option>
            <option>Central Province</option>
            <option>Sabragamuwa Province</option>
            <option>Uva Province</option>
          </select>
          <input type="text" name="city" placeholder="City" value={bookingData.city} onChange={handleChange} className="w-full border rounded-2xl p-4" required />
        </div>

        <textarea name="address" rows="4" placeholder="Complete Address" value={bookingData.address} onChange={handleChange} className="w-full border rounded-2xl p-4" required />

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-semibold transition">
          Proceed to Payment
        </button>
      </form>

      {product && (
        <div className="mt-12 border rounded-3xl p-5 shadow">
          <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <img src={`${API_URL}${product.image}`} alt={product.name} className="w-40 h-40 object-cover rounded-2xl" />

            <div className="flex-1">
              <h3 className="text-xl font-bold">{product.name}</h3>
              <p className="text-xs ">Rs. {product.pricePerDay} / Day</p>

              <div className="flex items-center gap-6 mt-2">
                <button onClick={() => changeQuantity(quantity - 1)} className="bg-gray-200 w-8 h-8 rounded-full text-xl">-</button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button onClick={() => changeQuantity(quantity + 1)} className="bg-gray-200 w-8 h-8 rounded-full text-xl">+</button>
              </div>

              {stockError && <p className="text-red-600 mt-2">{stockError}</p>}

              <div className="mt-8 text-xs ">
                <p>Available Stock: <strong className="text-green-600">{product.available}</strong></p>
                <p>Quantity: <strong>{quantity}</strong></p>
                <p>Days: <strong>{days}</strong></p>
                
              </div>
            </div>
          </div>
          <div className="mt-7 rounded-3xl bg-gray-950 text-white p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <p className="text-sm text-gray-400">Estimated Rental Total</p>
          <p className="text-xs text-gray-500 mt-1">
            Final amount based on quantity and rental days
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-3xl md:text-4xl font-extrabold text-green-400">
            Rs. {Number(totalAmount || 0).toLocaleString()}
          </p>
        </div>
      </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6">Choose Payment</h2>

            <div className="space-y-4 text-gray-700 mb-8">
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Quantity:</strong> {quantity}</p>
              <p><strong>Days:</strong> {days}</p>
              <p><strong>Total:</strong> Rs. {totalAmount}</p>
            </div>

            {days === 1 ? (
              <div className="space-y-4">
                <button onClick={() => handleBooking("On Site")} className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700">Pay On Site</button>
                <button onClick={handleAdvancePayment} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700">Pay Advance (50%)</button>
              </div>
            ) : (
              <button onClick={handleAdvancePayment} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700">Pay Advance (50%)</button>
            )}

            <button onClick={() => setShowPopup(false)} className="w-full mt-6 border py-4 rounded-2xl hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;