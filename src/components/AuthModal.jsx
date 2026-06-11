import React, { useState } from "react";
import {assets} from "../assets/assets.js";

const AuthModal = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(false);

  return (
        <div
  className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/50 flex items-center justify-center"
  onClick={onClose}
>
      <div
  className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-[90%] max-w-5xl flex"
  onClick={(e) => e.stopPropagation()}
>
  <button
    onClick={onClose}
    className="absolute top-4 right-4 text-3xl font-bold text-gray-500 hover:text-black"
  >
    ×
  </button>
        
        {/* Left Side */}
        <div className="w-1/2 bg-secondary text-white p-10 flex flex-col justify-center items-center">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-50 h-40 object-contain mb-6"
          />

          <p className="text-center text-lg">
            Welcome to QuickRent.
            Rent anything you need with ease and convenience.
          </p>
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10">
          {!isSignup ? (
            <>
              <h2 className="text-3xl font-bold mb-8">
                Login
              </h2>

              <form className="space-y-5">
                <input
                  type="email"
                  placeholder="Gmail Address"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </button>
              </form>

              <p className="text-center mt-6">
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
              <h2 className="text-3xl font-bold mb-8">
                Sign Up
              </h2>

              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="email"
                  placeholder="Gmail Address"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="tel"
                  placeholder="Contact Number"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="text"
                  placeholder="NIC Number"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full border rounded-lg p-3"
                />

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Create Account
                </button>
              </form>

              <p className="text-center mt-6">
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