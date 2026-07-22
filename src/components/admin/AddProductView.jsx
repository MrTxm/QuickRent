import React from "react";
import { emptyProductForm } from "./adminConfig";
import { FileImageInput } from "./SharedUI";

const AddProductView = ({ categories, productForm, setProductForm, editingProductId, setEditingProductId, handleProductSubmit, saving }) => {
  const handleImageFile = (file) => {
    setProductForm({
      ...productForm,
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : "",
    });
  };

  const clearForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  return (
    <div className="admin-card admin-form-card admin-single-form-card">
      <div className="admin-card-head">
        <div>
          <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
          <p>Select an image from your computer and manage equipment details.</p>
        </div>
        {editingProductId && <button type="button" className="admin-btn admin-btn-light" onClick={clearForm}>Clear Edit</button>}
      </div>

      <form onSubmit={handleProductSubmit} className="admin-form-grid">
        <input className="admin-input" placeholder="Product ID" value={productForm.product_id} onChange={(e) => setProductForm({ ...productForm, product_id: e.target.value })} required />
        <input className="admin-input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
        <textarea className="admin-textarea wide" placeholder="Description" rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
        <input className="admin-input" type="number" placeholder="Price per day" value={productForm.pricePerDay} onChange={(e) => setProductForm({ ...productForm, pricePerDay: e.target.value })} required />
        <select className="admin-select" value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} required>
          <option value="">Category</option>
          {categories.map((category) => <option key={category._id} value={category.category_id}>{category.name}</option>)}
        </select>
        <input className="admin-input" type="number" placeholder="Available stock" value={productForm.available} onChange={(e) => setProductForm({ ...productForm, available: e.target.value })} required />
        <input className="admin-input" type="number" placeholder="Damaged stock" value={productForm.damaged} onChange={(e) => setProductForm({ ...productForm, damaged: e.target.value })} />

        <FileImageInput
          label="Product photo"
          value={productForm.image}
          preview={productForm.imagePreview}
          onFileChange={handleImageFile}
          onClear={() => setProductForm({ ...productForm, image: "", imageFile: null, imagePreview: "" })}
        />

        <div className="wide admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-dark" disabled={saving}>{saving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}</button>
          <button type="button" className="admin-btn admin-btn-light" onClick={clearForm}>Reset</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductView;
