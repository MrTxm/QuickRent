import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getImageSrc, money } from "./adminHelpers";
import { EmptyBlock, SectionHeader } from "./SharedUI";

const InventoryView = ({ products, search, setSearch, editProduct, deleteProduct, setActiveTab }) => (
  <div className="admin-card admin-section-card">
    <SectionHeader
      title="Inventory"
      subtitle="Current products, available stock and damaged stock."
      search={search}
      setSearch={setSearch}
      buttonText="Add Product"
      onButton={() => setActiveTab("addProduct")}
    />
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="admin-product-cell">
                  {product.image && <img src={getImageSrc(product.image)} alt={product.name} />}
                  <span><strong>{product.name}</strong><small>ID: {product.product_id}</small></span>
                </div>
              </td>
              <td>{product.category_id}</td>
              <td>{money(product.pricePerDay)}</td>
              <td>
                <span className="admin-status admin-status-confirmed">{product.available || 0} available</span>
                <span className="admin-status admin-status-damaged ml-2">{product.damaged || 0} damaged</span>
              </td>
              <td>
                <div className="admin-action-stack horizontal">
                  <button type="button" className="admin-btn admin-btn-light" onClick={() => { editProduct(product); setActiveTab("addProduct"); }}><FaEdit /> Edit</button>
                  <button type="button" className="admin-btn admin-btn-danger" onClick={() => deleteProduct(product._id)}><FaTrash /> Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length && <EmptyBlock text="No products found" />}
    </div>
  </div>
);

export default InventoryView;
