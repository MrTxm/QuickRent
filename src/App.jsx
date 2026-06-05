import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import { Routes, Route } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";
import AuthModal from "./components/AuthModal";

const App = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "light"
  );

  return (
    <div className="dark:bg-black">
      <Navbar theme={theme} setTheme={setTheme} />
      

      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;