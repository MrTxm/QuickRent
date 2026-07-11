import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import { Routes, Route, useLocation } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";
import AuthModal from "./components/AuthModal";
import SearchResults from "./pages/SearchResults";
import SingleProduct from "./pages/SingleProduct.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import Profile from "./pages/Profile";
import CartCheckout from "./pages/CartCheckout";
import CartPaymentPage from "./pages/CartPaymentPage";
import OrderSuccess from "./pages/OrderSuccess";
import Service from "./pages/Service.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import GoBack from "./components/GoBack.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  const location = useLocation();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const [showAuth, setShowAuth] = useState(false);

  const isAdminPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  return (
    <div className="dark:bg-black">
      <Toaster position="top-center" />

      {!isAdminPage && <Navbar theme={theme} setTheme={setTheme} />}

      <Routes>
        <Route path="/" element={<Home theme={theme} />} />

        <Route path="/category/:categoryId" element={<CategoryPage />} />

        <Route path="/search/:keyword" element={<SearchResults />} />

        <Route
          path="/product/:categoryId/:productId"
          element={<SingleProduct setShowAuth={setShowAuth} />}
        />

        <Route
          path="/payment/:categoryId/:productId"
          element={<PaymentPage />}
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/CartCheckout" element={<CartCheckout />} />

        <Route path="/cart-payment" element={<CartPaymentPage />} />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route path="/service" element={<Service />} />
        <Route path="/Service" element={<Service />} />

        <Route path="/about" element={<About />} />
        <Route path="/About" element={<About />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/Contact" element={<Contact />} />

        <Route path="/GoBack" element={<GoBack />} />

        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {!isAdminPage && <Footer />}
    </div>
  );
};

export default App;