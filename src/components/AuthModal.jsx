import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    nic: "",
    password: "",
    confirmPassword: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const closeModal = () => {
    if (typeof onClose === "function") onClose();
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        fullName: signupData.fullName.trim(),
        email: signupData.email.trim().toLowerCase(),
        contactNumber: signupData.contactNumber.trim(),
        nic: signupData.nic.trim(),
        password: signupData.password.trim(),
      });

      toast.success("Account Created Successfully");

      setSignupData({
        fullName: "",
        email: "",
        contactNumber: "",
        nic: "",
        password: "",
        confirmPassword: "",
      });

      setIsSignup(false);
    } catch (error) {
      console.log("SIGNUP ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Signup Failed");
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  const loginPromise = axios
    .post(`${API_URL}/api/auth/login`, {
      email: loginData.email.trim().toLowerCase(),
      password: loginData.password.trim(),
    })
    .then((res) => {
      const loggedUser = res.data.user;
      const userRole = res.data.role || loggedUser?.role;

      if (!loggedUser) {
        throw new Error("Login success, but user data was not received");
      }

      return {
        loggedUser,
        userRole,
      };
    });

  try {
    const { loggedUser, userRole } = await toast.promise(loginPromise, {
      loading: "Logging in...",
      success: ({ loggedUser }) => (
        <b>Welcome, {loggedUser.fullName || loggedUser.email}!</b>
      ),
      error: (error) => (
        <b>
          {error.response?.data?.message ||
            error.message ||
            "Login failed"}
        </b>
      ),
    });

    localStorage.setItem("user", JSON.stringify(loggedUser));

    if (userRole === "admin") {
      localStorage.setItem("quickrent_admin", JSON.stringify(loggedUser));
      closeModal();
      navigate("/dashboard");
    } else {
      localStorage.removeItem("quickrent_admin");
      closeModal();
      navigate("/");
    }
  } catch (error) {
    console.log("LOGIN ERROR:", error.response?.data || error.message);
  }
};

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4 py-6 overflow-y-auto"
      onClick={closeModal}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row max-h-[95vh] md:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-4 z-20 text-3xl font-bold text-gray-500 hover:text-black"
        >
          ×
        </button>

        {/* Left Branding Section */}
        <div className="w-full md:w-1/2 lg:bg-secondary text-white px-6 py-5 md:p-10 flex flex-col justify-center items-center">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-32 h-20 md:w-50 md:h-40 object-contain md:mb-6"
          />

          {/* Show this text only on desktop */}
          <p className="hidden md:block text-center text-lg max-w-sm">
            Welcome to QuickRent. Rent anything you need with ease and convenience.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 overflow-y-auto pt-1">
          {!isSignup ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                Login
              </h2>

              <form className="space-y-4 md:space-y-5" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Gmail Address"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </button>
              </form>

              <p className="text-center mt-5 md:mt-6 text-sm md:text-base">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignup(true)}
                  className="text-blue-600 font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                Sign Up
              </h2>

              <form className="space-y-3 md:space-y-4" onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupData.fullName}
                  onChange={(e) =>
                    setSignupData({ ...signupData, fullName: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <input
                  type="email"
                  placeholder="Gmail Address"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={signupData.contactNumber}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      contactNumber: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <input
                  type="text"
                  placeholder="NIC Number"
                  value={signupData.nic}
                  onChange={(e) =>
                    setSignupData({ ...signupData, nic: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Create Account
                </button>
              </form>

              <p className="text-center mt-5 md:mt-6 text-sm md:text-base">
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignup(false)}
                  className="text-blue-600 font-semibold"
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;