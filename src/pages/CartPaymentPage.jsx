import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GoBack from "../components/GoBack";
import toast from "react-hot-toast";

const CartPaymentPage = () => {
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [processing, setProcessing] = useState(false);

    const [bookingData, setBookingData] = useState({
        customerName: user?.fullName || "",
        gmail: user?.email || "",
        contactNumber:user?.contactNumber || "",
        nic: user?.nic || "",
        province: "",
        city: "",
        address: "",
        startDate: "",
        endDate: ""
    });

    // Load Cart Items
    const fetchCart = async () => {
        try {
            if (!user?._id) return;
            const res = await axios.get(`http://localhost:5000/api/cart/${user._id}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Cart Fetch Error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Handle Input Changes
    const handleChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    // Calculate Rental Days
    const rentalDays = bookingData.startDate && bookingData.endDate
        ? Math.ceil(
            (new Date(bookingData.endDate) - new Date(bookingData.startDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1
        : 0;

    // Grand Total
    const grandTotal = cartItems.reduce(
        (sum, item) => sum + (item.pricePerDay || 0) * (item.quantity || 1) * (rentalDays || 0),
        0
    );

    // Form Validation
    const validateForm = () => {
        if (
            !bookingData.customerName ||
            !bookingData.gmail ||
            !bookingData.contactNumber ||
            !bookingData.nic ||
            !bookingData.province ||
            !bookingData.city ||
            !bookingData.address ||
            !bookingData.startDate ||
            !bookingData.endDate
        ) {
            toast.error("Please fill all required fields!");
            return false;
        }
        if (new Date(bookingData.endDate) < new Date(bookingData.startDate)) {
            alert("End date must be after Start date!");
            return false;
        }
        return true;
    };

    // Check Availability
    const checkAvailability = async () => {
        const res = await axios.post("http://localhost:5000/api/checkout/check", {
            userId: user._id,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate
        });
        return res.data;
    };

    // Confirm Booking
    const confirmCheckout = async (paymentMethod, paymentStatus, transactionId = "") => {
        const res = await axios.post("http://localhost:5000/api/checkout/confirm", {
            userId: user._id,
            bookingData,
            paymentMethod,
            paymentStatus,
            transactionId
        });
        return res.data;
    };

    // On Site Payment
    const handleOnSitePayment = async () => {
        if (!validateForm()) return;

        try {
            setProcessing(true);
            const check = await checkAvailability();

            if (!check.available) {
                const msg = check.unavailableItems
                    ?.map(i => `${i.productName} - ${i.reason}`)
                    .join("\n") || "Some items are unavailable";
                toast.error(msg);
                return;
            }

            const result = await confirmCheckout("On Site", "Pending");
            navigate("/order-success", { state: result });
        } catch (err) {
            console.log(err.response?.config?.url);
            console.log(err.response?.status);
            console.log(err.response?.data);
            console.error("On Site Payment Error:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Checkout Failed");
        } finally {
            setProcessing(false);
        }
    };

    // Advance Payment (PayHere 50%)
    const handleAdvancePayment = async () => {
        if (!validateForm()) return;

        try {
            setProcessing(true);
            const check = await checkAvailability();

            if (!check.available) {
                const msg = check.unavailableItems
                    ?.map(i => `${i.productName} - ${i.reason}`)
                    .join("\n") || "Some items are unavailable";
                alert(msg);
                return;
            }

            const amount = (grandTotal * 0.5).toFixed(2);

            const paymentRes = await axios.post("http://localhost:5000/api/payment/generate", {
                orderId: "QR-" + Date.now(),
                amount,
                firstName: bookingData.customerName,
                lastName: "",
                email: bookingData.gmail,
                phone: bookingData.contactNumber,
                address: bookingData.address,
                city: bookingData.city
            });

            const paymentData = paymentRes.data;

            window.payhere.onCompleted = async (orderId) => {
                try {
                    const result = await confirmCheckout("Advance", "Paid", orderId);
                    navigate("/order-success", { state: result });
                } catch (err) {
                    alert("Failed to save booking after payment");
                }
            };

            window.payhere.onDismissed = () => {
                alert("Payment Cancelled");
            };

            window.payhere.onError = (err) => {
                console.error(err);
                alert("Payment Error");
            };

            window.payhere.startPayment(paymentData);
        } catch (err) {
            console.error("Advance Payment Error:", err.response?.data || err);
            alert("Payment initiation failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-4xl font-bold animate-pulse">Loading Checkout...</h1>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-4xl font-bold">Your Cart is Empty</h1>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <GoBack/>
            <h1 className="text-4xl font-bold mt-8 text-center md:text-left">Checkout</h1>

            {/* Booking Form */}
            <div className="bg-white shadow-xl rounded-2xl p-8">
                <h2 className="text-3xl font-bold mb-6">Booking Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="customerName" value={bookingData.customerName} onChange={handleChange} placeholder="Full Name" className="border p-4 rounded-xl" required />
                    <input name="gmail" value={bookingData.gmail} onChange={handleChange} placeholder="Email" className="border p-4 rounded-xl" required />
                    <input name="contactNumber" value={bookingData.contactNumber} onChange={handleChange} placeholder="Contact Number" className="border p-4 rounded-xl" required />
                    <input
                        type="text"
                        name="nic"
                        value={bookingData.nic}
                        onChange={handleChange}
                        placeholder="NIC Number"
                        className="w-full border rounded-2xl p-4"
                        required
                    />
                    <select name="province" value={bookingData.province} onChange={handleChange} className="border p-4 rounded-xl" required>
                        <option value="">Select Province</option>
                        <option>Western Province</option>
                        <option>Central Province</option>
                        <option>Southern Province</option>
                        <option>Northern Province</option>
                        <option>Eastern Province</option>
                    </select>

                    <input name="city" value={bookingData.city} onChange={handleChange} placeholder="City" className="border p-4 rounded-xl" required />

                    <input type="date" name="startDate" min={new Date().toISOString().split("T")[0]} value={bookingData.startDate} onChange={handleChange} className="border p-4 rounded-xl" required />
                    <input type="date" name="endDate" min={bookingData.startDate} value={bookingData.endDate} onChange={handleChange} className="border p-4 rounded-xl" required />
                </div>

                <textarea
                    name="address"
                    value={bookingData.address}
                    onChange={handleChange}
                    placeholder="Complete Address"
                    rows={4}
                    className="border p-4 rounded-xl w-full mt-6"
                    required
                />

                {/* Summary & Buttons */}
                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-xl">Rental Days: <strong>{rentalDays}</strong></p>
                        <p className="text-3xl font-bold mt-2">Grand Total: Rs. {grandTotal}</p>
                    </div>

                    {rentalDays > 0 && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleOnSitePayment}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50"
                            >
                                {processing ? "Processing..." : "Pay On Site"}
                            </button>

                            <button
                                onClick={handleAdvancePayment}
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50"
                            >
                                {processing ? "Processing..." : "Pay Advance (50%)"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-6 mt-12">
                {cartItems.map((item) => (
                    <div key={item._id} className="flex flex-col md:flex-row gap-6 border rounded-2xl p-6 shadow">
                        <img
                            src={`http://localhost:5000${item.productImage}`}
                            alt={item.productName}
                            className="w-50 md:w-32 h-40  rounded-xl"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold">{item.productName}</h2>
                            <p className="text-lg mt-2">Rs. {item.pricePerDay} / Day × {item.quantity}</p>
                            <p className="text-xl font-bold mt-3">
                                Rs. {(item.pricePerDay * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
    );
};

export default CartPaymentPage;