import React, { useState } from "react";

const AdminProfileModal = ({ admin, onClose, onSubmit, saving }) => {
  const [form, setForm] = useState({
    fullName: admin?.fullName || "",
    email: admin?.email || "",
    password: "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal-card admin-profile-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="admin-card-head">
          <div>
            <h3>Administrator Account</h3>
            <p>Manage your admin account details.</p>
          </div>
          <button type="button" className="admin-btn admin-btn-light" onClick={onClose}>Close</button>
        </div>

        <div className="admin-form-grid">
          <input className="admin-input wide" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input className="admin-input wide" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="admin-input wide" type="password" placeholder="New password, optional" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <button type="submit" className="admin-btn admin-btn-dark w-full" disabled={saving}>{saving ? "Saving..." : "Save Account"}</button>
      </form>
    </div>
  );
};

export default AdminProfileModal;
