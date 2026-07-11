import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { Commet } from "react-loading-indicators";
import { CartContext } from "../context/CartContext";
import GoBack from "../components/GoBack";
import toast from "react-hot-toast";

const CategoryPage = () => {

    const { categoryId } = useParams();

    const navigate = useNavigate();

    const { refreshCart } = useContext(CartContext);

    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState([]);

    useEffect(() => {

        axios
            .get(`http://localhost:5000/api/products/category/${categoryId}`)
            .then((res) => {
                setProducts(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [categoryId]);

    const addToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login first");

    try {
        await axios.post("http://localhost:5000/api/cart", {
            userId: user._id,
            productId: product.product_id || product._id,
           categoryId: Number(categoryId),   // ← Send ObjectId
            productName: product.name,
            productImage: product.image,
            pricePerDay: product.pricePerDay
        });

        toast.success("Added to Cart");
        window.dispatchEvent(new Event("cartUpdated"));

    } catch (error) {
        console.error(error.response?.data || error);
        toast("Failed to add to cart");
    }
};

    if (loading) {

        return (

            <div className="fixed inset-0 flex justify-center items-center bg-white z-50">

                <Commet
                    color={[
                        "#7a511d",
                        "#a36c27",
                        "#cc8731",
                        "#d79f59"
                    ]}
                />

            </div>

        );

    }

    return (

        <div className="p-10">
            <GoBack/>

            <h1 className="text-3xl font-bold mb-8">

                Products

            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {products.map((product) => (

                    <div
                        key={product._id}
                        className="bg-white rounded-xl shadow-lg p-4 hover:shadow-2xl transition"
                    >

                        <img
                            src={`http://localhost:5000${product.image}`}
                            alt={product.name}
                            className="w-full h-80 object-cover rounded-lg"
                        />

                        <h2 className="mt-4 text-2xl font-bold">

                            {product.name}

                        </h2>

                        <div className="h-24 overflow-y-auto text-gray-600 text-sm mt-2">

                            {product.description}

                        </div>

                        <p className="mt-3 font-semibold">

                            Rs. {product.pricePerDay} / day

                        </p>

                        <p className={`mt-2 font-semibold ${
                            product.available === 0 ? "text-red-500" : "text-green-600"
                        }`}>
                            {product.available === 0
                                ? "Out of Stock"
                                : `Available: ${product.available}`
                            }
                        </p>

                        <div className="flex gap-3 mt-5">

                            <button
                                onClick={() =>
                                    navigate(
                                        `/product/${categoryId}/${product.product_id}`
                                    )
                                }
                                className="flex-1 bg-mainbtn py-3 rounded-full hover:scale-105 transition"
                            >
                                See Preview
                            </button>

                            <button  
                                disabled={product.available === 0}
                                onClick={() => {
                                    console.log("Button clicked");
                                    addToCart(product);
                                }}
                                className={`text-sm flex content-center px-5 py-2.5 m-auto rounded-full transition-all
                                    ${product.available === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-mainbtn hover:scale-105"
                                    }`
                                }
                            >

                                <img
                                    src={assets.cart}
                                    alt="cart"
                                    className="w-8 h-8"
                                />

                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

};

export default CategoryPage;