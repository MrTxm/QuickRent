import React, { useState } from "react";
import axios from "axios";

const AccountSettings = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        contactNumber: user?.contactNumber || "",
        nic: user?.nic || "",
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/auth/profile/${user._id}`, formData);
            localStorage.setItem("user", JSON.stringify(res.data));
            setUser(res.data);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert("Passwords do not match");
        }

        try {
            await axios.put(`http://localhost:5000/api/auth/change-password/${user._id}`, passwordData);
            alert("Password changed successfully!");
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8">Account Settings</h2>

            {/* Profile Information */}
            <form onSubmit={handleProfileUpdate} className="mb-12">
                <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Full Name"
                        className="p-4 border rounded-2xl"
                    />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email"
                        className="p-4 border rounded-2xl"
                    />
                    <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="Contact Number"
                        className="p-4 border rounded-2xl"
                    />
                    <input
                        type="text"
                        value={formData.nic}
                        onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                        placeholder="NIC Number"
                        className="p-4 border rounded-2xl"
                    />
                </div>
                <button type="submit" className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl">Save Changes</button>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePasswordChange}>
                <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full p-4 border rounded-2xl"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full p-4 border rounded-2xl"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full p-4 border rounded-2xl"
                    />
                </div>
                <button type="submit" className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl">Change Password</button>
            </form>
        </div>
    );
};

export default AccountSettings;