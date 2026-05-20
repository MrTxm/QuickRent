import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
  console.log("Category ID from URL:", categoryId);

  axios
    .get(`http://localhost:5000/api/products/category/${categoryId}`)
    .then((res) => {
       console.log("API RESPONSE:", res.data);
      setProducts(res.data);
    })
    .catch((err) => console.log(err));
}, [categoryId]);

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-8">Products</h1>

    {products.length === 0 && <p>No products found</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-lg/30 rounded-xl p-4"
          >
            <img
              src={`http://localhost:5000${product.image}`}
              alt={''}
              className="w-full h-90 object-cover rounded-lg"
            />
            <h2 className="mt-4 text-lg font-semibold">
              {product.name}
            </h2>
            <p className="text-gray-600">
              Rs. {product.pricePerDay} / day
            </p>
            <div>On Stock: {product.available}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;