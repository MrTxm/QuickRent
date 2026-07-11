import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AddressSection = ({ user }) => {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            fetchAddresses();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/address/${user._id}`);
            setAddresses(res.data);
        } catch (err) {
            console.error("Address fetch error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (addr) => {
        setEditingAddress(addr);
        setFormData(addr);
    };

    const saveAddress = async () => {
        try {
            if (editingAddress?._id) {
                await axios.put(`${API_URL}/api/address/${editingAddress._id}`, formData);
            } else {
                await axios.post(`${API_URL}/api/address`, { ...formData, userId: user._id });
            }
            fetchAddresses();
            setEditingAddress(null);
            setFormData({});
            alert("Address saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save address");
        }
    };

    if (loading) return <p>Loading addresses...</p>;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Saved Addresses</h2>
                <button
                    onClick={() => setEditingAddress({})}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
                >
                    + Add New Address
                </button>
            </div>

            {/* Add/Edit Form */}
            {editingAddress !== null && (
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border">
                    <h3 className="font-semibold mb-4">Address Details</h3>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName || ""}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full p-3 border rounded-xl mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Contact Number"
                        value={formData.contactNumber || ""}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full p-3 border rounded-xl mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Full Address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-3 border rounded-xl mb-3"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.city || ""}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="p-3 border rounded-xl"
                        />
                        <input
                            type="text"
                            placeholder="Province"
                            value={formData.province || ""}
                            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                            className="p-3 border rounded-xl"
                        />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={saveAddress} className="bg-green-600 text-white px-8 py-3 rounded-xl">Save Address</button>
                        <button onClick={() => setEditingAddress(null)} className="bg-gray-400 text-white px-8 py-3 rounded-xl">Cancel</button>
                    </div>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No saved addresses yet.</p>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr._id} className="border rounded-2xl p-6 flex justify-between items-center hover:shadow-md transition">
                            <div>
                                <p className="font-semibold text-lg">{addr.fullName}</p>
                                <p className="text-gray-600">{addr.address}, {addr.city}, {addr.province}</p>
                                <p className="text-gray-500 mt-1">{addr.contactNumber}</p>
                            </div>
                            <button 
                                onClick={() => handleEdit(addr)}
                                className="text-blue-600 hover:text-blue-700 p-2"
                            >
                                <FaEdit size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddressSection;