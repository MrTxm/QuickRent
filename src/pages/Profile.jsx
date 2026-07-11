import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaEdit, FaPrint, FaTrash } from "react-icons/fa";
import axios from "axios";
import MyBookings from "../components/MyBookings";
import Wishlist from "../components/Wishlist";
import Cart from "../components/Cart";
import AddressSection from "../components/AddressSection";
import AccountSettings from "../components/AccountSettings"
import GoBack from "../components/GoBack";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState("dashboard");
    const [stats, setStats] = useState({ bookings: 0, wishlist: 0, cart: 0 });
    const [loading, setLoading] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        if (loggedUser) {
            setUser(loggedUser);
            loadStats(loggedUser);
        }
    }, []);

    const loadStats = async (loggedUser) => {
        try {
            const [bookingsRes, wishlistRes, cartRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/bookings/user/${loggedUser.email}`),
                axios.get(`http://localhost:5000/api/wishlist/${loggedUser._id}`),
                axios.get(`http://localhost:5000/api/cart/${loggedUser._id}`)
            ]);

            setStats({
                bookings: bookingsRes.data.length,
                wishlist: wishlistRes.data.length,
                cart: cartRes.data.length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Upload Profile Image
    const uploadImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append("profile", file);

            const res = await axios.post(
                `http://localhost:5000/api/auth/upload-profile/${user._id}`,
                formData
            );

            const updatedUser = res.data;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert("Profile picture updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to upload image");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/logout", { email: user.email });
            localStorage.removeItem("user");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className=" mx-auto p-6 md:p-10 min-h-screen bg-gray-50">
            <GoBack/>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 mt-5">
                <h1 className="text-4xl font-bold text-gray-800">My Account</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center mb-8">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <img
                                    src={
                                        user?.profileImage
                                            ? `http://localhost:5000/profile/${user.profileImage}`
                                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <FaCamera className="text-white text-3xl" />
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => uploadImage(e.target.files[0])}
                                className="hidden"
                            />
                            <h2 className="mt-4 text-2xl font-semibold">{user?.fullName}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>

                        {/* Menu */}
                        <nav className="space-y-2">
                            {[
                                { key: "dashboard", label: "Dashboard" },
                                { key: "bookings", label: "My Bookings" },
                                { key: "wishlist", label: "Wishlist" },
                                { key: "cart", label: "Cart" },
                                { key: "address", label: "Saved Addresses" },
                                { key: "settings", label: "Account Settings" },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setSelectedMenu(item.key)}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all ${
                                        selectedMenu === item.key
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    {selectedMenu === "dashboard" && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold">Welcome back, {user?.fullName?.split(" ")[0]}!</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-3xl shadow-lg">
                                    <h3 className="text-5xl font-bold text-blue-600">{stats.bookings}</h3>
                                    <p className="text-xl mt-2">Total Bookings</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-lg">
                                    <h3 className="text-5xl font-bold text-purple-600">{stats.wishlist}</h3>
                                    <p className="text-xl mt-2">Wishlist Items</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-lg">
                                    <h3 className="text-5xl font-bold text-green-600">{stats.cart}</h3>
                                    <p className="text-xl mt-2">Cart Items</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMenu === "bookings" && <MyBookings />}
                    {selectedMenu === "wishlist" && <Wishlist />}
                    {selectedMenu === "cart" && <Cart />}
                    {selectedMenu === "address" && <AddressSection user={user} />}
                    {selectedMenu === "settings" && <AccountSettings user={user} setUser={setUser} />}
                </div>
            </div>
        </div>
    );
};

export default Profile;