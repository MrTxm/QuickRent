import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoBack from "../components/GoBack";

const CartCheckout = () => {

    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {

        if (!user) {
            navigate("/");
            return;
        }

        fetchCart();

    }, []);

    const fetchCart = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/cart/${user._id}`
            );
            setCartItems(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const increaseQty = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/cart/increase/${id}`
            );
            fetchCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.log(error);
        }
    };

    const decreaseQty = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/cart/decrease/${id}`
            );
            fetchCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.log(error);
        }
    };

    const removeItem = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/cart/${id}`
            );
            fetchCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.log(error);
        }
    };
    const total = cartItems.reduce(
        (sum, item) =>
            sum +
            item.pricePerDay *
            item.quantity,
        0
    );
    if (loading) {
        return (
            <div className="text-center text-3xl mt-20">
                Loading...
            </div>
        );
    }
    if (cartItems.length === 0) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-4xl font-bold">
                    Your Cart is Empty
                </h1>
            </div>
        );
    }
    return (
        
        <div className=" mx-auto p-10">
            <GoBack/>
            <h1 className="text-4xl font-bold mb-8 mt-5">
                Shopping Cart
            </h1>
            {
                cartItems.map(item => (
                    <div
                        key={item._id}
                        className="flex gap-5 border rounded-xl p-5 mb-5"
                    >
                        <img
                            src={`http://localhost:5000${item.productImage}`}
                            className="w-50 h-40 rounded-xl object-cover"
                            alt=""
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">
                                {item.productName}
                            </h2>
                            <p>
                                Rs. {item.pricePerDay} / day
                            </p><br />
                            {/* <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() => decreaseQty(item._id)}
                                    className="bg-gray-200 px-4 py-1 rounded"
                                >
                                    -
                                </button>*/
                                <span>
                                   Selected Quantity<span className="text-green-600 text-xl pl-5">{item.quantity}</span>
                                </span>
                                /*<button
                                    onClick={() => increaseQty(item._id)}
                                    className="bg-gray-200 px-4 py-1 rounded"
                                >
                                    +
                                </button>
                            </div> */}
                            <p className="font-bold mt-3">
                                Rs.
                                {
                                    item.pricePerDay *
                                    item.quantity
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => removeItem(item._id)}
                            className="text-red-600"
                        >
                            Remove
                        </button>
                    </div>
                ))
            }
            <hr />
            <div className="flex justify-between items-center mt-6">
                <h2 className="text-3xl font-bold">
                    Total : Rs. {total}
                </h2>
                <button
                    onClick={() => navigate("/cart-payment")}
                    className="bg-mainbtn px-10 py-4 rounded-xl text-xl"
                >
                    Proceed Checkout
                </button>
            </div>
        </div>
    );
};

export default CartCheckout;