import React from "react";
import { money } from "./adminHelpers";
import { SummaryLine } from "./SharedUI";

const OnSiteBookingView = ({ products, form, setForm, selectedProduct, days, total, handleSubmit, saving }) => (
  <div className="admin-onsite-grid">
    <div className="admin-card admin-form-card">
      <h3>Create On Site Booking</h3>
      <p>New shop bookings stay pending until admin confirms product handover and collects payment.</p>
      <form onSubmit={handleSubmit} className="admin-form-grid">
        <select className="admin-select wide" value={form.productMongoId} onChange={(e) => setForm({ ...form, productMongoId: e.target.value })} required>
          <option value="">Select product</option>
          {products.map((product) => <option key={product._id} value={product._id}>{product.name} · {money(product.pricePerDay)} · {product.available} available</option>)}
        </select>
        <input className="admin-input" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
        <input className="admin-input" type="email" placeholder="Customer email" value={form.gmail} onChange={(e) => setForm({ ...form, gmail: e.target.value })} required />
        <input className="admin-input" placeholder="Contact number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
        <input className="admin-input" placeholder="NIC" value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} required />
        <input className="admin-input" placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
        <input className="admin-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input className="admin-input wide" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input className="admin-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input className="admin-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        <input className="admin-input" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        <div className="admin-pending-note">Payment status: Pending</div>
        <button type="submit" className="admin-btn admin-btn-dark wide" disabled={saving}>{saving ? "Creating..." : "Create Pending Booking"}</button>
      </form>
    </div>

    <div className="admin-card admin-summary-card">
      <h3>Booking Summary</h3>
      <SummaryLine label="Product" value={selectedProduct?.name || "Not selected"} />
      <SummaryLine label="Price per day" value={selectedProduct ? money(selectedProduct.pricePerDay) : "-"} />
      <SummaryLine label="Days" value={days} />
      <SummaryLine label="Quantity" value={form.quantity || 1} />
      <div className="admin-total-line"><span>Total</span><strong>{money(total)}</strong></div>
    </div>
  </div>
);

export default OnSiteBookingView;
