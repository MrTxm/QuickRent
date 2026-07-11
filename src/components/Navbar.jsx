import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import Themetoggle from "./Themetoggle.jsx";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import CartSidebar from "./CartSidebar";
import AuthModal from "./AuthModal";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { ImExit } from "react-icons/im";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  const [cartOpen, setCartOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const cartCount = cartItems?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0;

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await axios.post(`${API_URL}/api/auth/logout`, {
          email: user.email,
        });
      }

      localStorage.removeItem("user");
      //window.location.reload();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-12 lg:px-24 xl:px-40 py-4 sticky top-0 z-30 backdrop-blur-xl bg-secondary dark:bg-gray-900/70">
        
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer"
        >
          <img src={assets.logo} className="w-32 sm:w-40" alt="Logo" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/service")}>Categories</button>
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-2 w-80 text-black">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-transparent outline-none flex-1 text-sm"
          />

          <button
            onClick={handleSearch}
            className="bg-primary px-4 rounded-full text-black"
          >
            🔍
          </button>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Themetoggle theme={theme} setTheme={setTheme} />

          {/* Desktop Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative hidden sm:block"
          >
            <img
              src={theme === "dark" ? assets.cartW : assets.cartIcon}
              className="w-9"
              alt="Cart"
            />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex justify-center items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden"
          >
            <img src={assets.bar} alt="Menu" className="w-8" />
          </button>

          {/* Desktop User */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="text-black dark:text-white"
              >
                <FaUserCircle size={35} />
              </button>

              <button
                onClick={handleLogout}
                className="text-red-500 text-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="hidden sm:block bg-mainbtn px-6 py-2 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-[280px] max-w-[80vw] bg-mprimary text-white z-50 p-6 transition-transform duration-300 sm:hidden overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-5 text-2xl"
        >
          ✕
        </button>

        <div className="mt-16 flex flex-col gap-6 text-left font-medium">
          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
          >
            Home
          </button>

          <button
            onClick={() => {
              navigate("/service");
              setSidebarOpen(false);
            }}
          >
            Categories
          </button>

          <button
            onClick={() => {
              navigate("/about");
              setSidebarOpen(false);
            }}
          >
            About
          </button>

          <button
            onClick={() => {
              navigate("/contact");
              setSidebarOpen(false);
            }}
          >
            Contact
          </button>

          {/* Mobile Search */}
          <div className="flex items-center bg-white rounded-full px-4 py-2 text-black">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 outline-none bg-transparent text-sm"
            />

            <button onClick={handleSearch}>🔍</button>
          </div>

          {/* Mobile Cart */}
          <button
            onClick={() => {
              setCartOpen(true);
              setSidebarOpen(false);
            }}
            className="flex items-center justify-between border-t border-white/30 pt-5"
          >
            <span>Cart</span>

            <div className="relative">
              <img src={assets.cartIcon} alt="Cart" className="w-8" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex justify-center items-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
          </button>

          {/* Mobile Login / Logout */}
          {!user ? (
            <button
              onClick={() => {
                setShowAuth(true);
                setSidebarOpen(false);
              }}
              className="bg-mainbtn text-black py-3 rounded-full font-semibold"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/profile");
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3"
              >
                <FaUserCircle size={24} />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-400"
              >
                <ImExit size={22} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;