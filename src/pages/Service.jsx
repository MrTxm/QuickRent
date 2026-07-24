import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageSrc = (image) => {
  if (!image) return "";
  if (String(image).startsWith("http") || String(image).startsWith("data:")) {
    return image;
  }
  return `${API_URL}${image}`;
};

const Service = ({ theme }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);

        const sortedCategories = (res.data || []).sort(
          (a, b) => Number(a.category_id) - Number(b.category_id)
        );

        setCategories(sortedCategories);
      } catch (error) {
        console.log("CATEGORY LOAD ERROR:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <a href="/Service">
        <img
          src={theme === "dark" ? assets.downw : assets.downb}
          className="size-15 m-auto animate-bounce mt-15"
          alt="Down arrow"
        />
      </a>

      <h1 className="text-7xl text-center mt-10 dark:text-white">
        Our Services
      </h1>

      {loading && (
        <p className="text-center my-10 dark:text-white">
          Loading categories...
        </p>
      )}

      {!loading && categories.length === 0 && (
        <p className="text-center my-10 dark:text-white">
          No categories found
        </p>
      )}

      {categories.map((category, index) => {
        const imageLeft = index % 2 === 0;

        return (
          <div
            key={category._id || category.category_id}
            className="bg-mainbg shadow-xl/30 mx-4 lg:mx-16 my-10 rounded-xl overflow-hidden dark:bg-yellow-700"
          >
            <div
              className={`flex flex-col items-center ${
                imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              <div className="w-full lg:w-1/3">
                <img
                  src={getImageSrc(category.image)}
                  className="w-full h-80 object-cover animate-pulse hover:animate-pulse [animation-iteration-count:1]"
                  alt={category.name}
                />
              </div>

              <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl dark:text-white">
                  {category.name}
                </h2>

                <p className="text-sm sm:text-base lg:text-lg pt-4 dark:text-white">
                  {category.description}
                </p>

                <button
                  onClick={() => navigate(`/category/${category.category_id}`)}
                  className="mt-6 text-sm bg-mainbtn text-black px-8 py-3 rounded-full hover:scale-105 transition-all"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Service;