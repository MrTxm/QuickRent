import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { CartContext } from "../context/CartContext";
import GoBack from "../components/GoBack";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SearchResults = () => {
  const { addToCart } = useContext(CartContext);
  const { keyword } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL}/api/products/search/${encodeURIComponent(keyword)}`
        );

        setProducts(res.data || []);
      } catch (error) {
        console.log("SEARCH ERROR:", error.response?.data || error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  const getCategoryId = (product) => {
    return (
      product?.category?.category_id ||
      product?.categoryId ||
      product?.category_id
    );
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${API_URL}${image}`;
  };

  const handlePreview = (product) => {
    const categoryId = getCategoryId(product);

    if (!categoryId) {
      alert("Category ID is missing for this product");
      return;
    }

    navigate(`/product/${categoryId}/${product.product_id}`);
  };

  const handleAddToCart = (product) => {
    const available = Number(product.available || 0);

    if (available <= 0) {
      alert("This product is out of stock");
      return;
    }

    const categoryId = getCategoryId(product);

    addToCart({
      ...product,
      categoryId,
      category_id: categoryId,
    });
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-2xl font-bold">
        Searching products...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <GoBack/>
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>

      <p className="text-gray-500 mb-8">
        Results for: <span className="font-semibold">{keyword}</span>
      </p>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow">
          <h2 className="text-2xl font-bold text-gray-800">
            No products found
          </h2>
          <p className="text-gray-500 mt-2">
            Try searching with another product name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const available = Number(product.available || 0);
            const isOutOfStock = available <= 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-2xl transition"
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-lg"
                />

                <h2 className="mt-4 text-2xl font-bold line-clamp-1">
                  {product.name}
                </h2>

                <div className="h-24 overflow-y-auto text-gray-600 text-sm mt-2">
                  {product.description}
                </div>

                <p className="mt-3 font-semibold">
                  Rs. {product.pricePerDay} / day
                </p>

                <p
                  className={`mt-2 font-semibold ${
                    isOutOfStock ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : `Available: ${available}`}
                </p>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handlePreview(product)}
                    className="flex-1 bg-mainbtn py-3 rounded-full hover:scale-105 transition"
                  >
                    See Preview
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                    className={`text-sm flex items-center justify-center px-5 py-2.5 rounded-full transition-all ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-mainbtn hover:scale-105"
                    }`}
                  >
                    <img src={assets.cart} alt="cart" className="w-8 h-8" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;