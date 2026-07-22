import React from "react";
import { emptyCategoryForm } from "./adminConfig";
import { FileImageInput } from "./SharedUI";

const AddCategoryView = ({ categories, categoryForm, setCategoryForm, editingCategoryId, setEditingCategoryId, handleCategorySubmit, editCategory, deleteCategory, saving }) => {
  const handleImageFile = (file) => {
    setCategoryForm({
      ...categoryForm,
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : "",
    });
  };

  const clearForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  return (
    <div className="admin-dashboard-space">
      <div className="admin-card admin-form-card admin-single-form-card">
        <div className="admin-card-head">
          <div>
            <h3>{editingCategoryId ? "Edit Category" : "Add Category"}</h3>
            <p>Create rental categories and attach a category image from your computer.</p>
          </div>
          {editingCategoryId && <button type="button" className="admin-btn admin-btn-light" onClick={clearForm}>Clear Edit</button>}
        </div>

        <form onSubmit={handleCategorySubmit} className="admin-form-grid">
          <input className="admin-input" type="number" placeholder="Category ID" value={categoryForm.category_id} onChange={(e) => setCategoryForm({ ...categoryForm, category_id: e.target.value })} required />
          <input className="admin-input" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
          <input className="admin-input wide" placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />

          <FileImageInput
            label="Category photo"
            value={categoryForm.image}
            preview={categoryForm.imagePreview}
            onFileChange={handleImageFile}
            onClear={() => setCategoryForm({ ...categoryForm, image: "", imageFile: null, imagePreview: "" })}
          />

          <div className="wide admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-dark" disabled={saving}>{saving ? "Saving..." : editingCategoryId ? "Update Category" : "Add Category"}</button>
            <button type="button" className="admin-btn admin-btn-light" onClick={clearForm}>Reset</button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-section-card">
        <div className="admin-card-head"><div><h3>Categories</h3><p>Edit or delete existing categories.</p></div></div>
        <div className="admin-chip-list">
          {categories.map((category) => (
            <span key={category._id} className="admin-category-chip">
              {category.name}
              <button type="button" onClick={() => editCategory(category)}>Edit</button>
              <button type="button" onClick={() => deleteCategory(category._id)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryView;
