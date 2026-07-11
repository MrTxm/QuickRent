import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { assets } from "../../assets/assets";
import { AiFillBell } from "react-icons/ai";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "bookings", label: "Bookings", icon: "▣" },
  { id: "inventory", label: "Inventory", icon: "□" },
  { id: "customers", label: "Customers", icon: "◉" },
  { id: "onsite", label: "On Site", icon: "⌖" },
  { id: "reports", label: "Reports", icon: "◒" },
];

const emptyProductForm = {
  product_id: "",
  name: "",
  description: "",
  pricePerDay: "",
  category_id: "",
  image: "",
  available: "",
  damaged: "",
};

const emptyCategoryForm = {
  category_id: "",
  name: "",
  description: "",
  image:"",
};

const emptyOnSiteForm = {
  productMongoId: "",
  customerName: "",
  gmail: "",
  contactNumber: "",
  nic: "",
  province: "",
  city: "",
  address: "",
  startDate: "",
  endDate: "",
  quantity: 1,
};

const readAdmin = () => {
  const saved = localStorage.getItem("quickrent_admin") || localStorage.getItem("user");
  if (!saved) return null;

  try {
    const user = JSON.parse(saved);
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
};

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

const shortDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthKey = (value) => {
  const date = value ? new Date(value) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const initials = (name = "Admin") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "AD";

const statusClass = (status) =>
  `admin-status admin-status-${String(status || "pending").toLowerCase().replace(/\s+/g, "-")}`;

const normalizeStatus = (value) => String(value || "").toLowerCase().replace(/\s+/g, "-");
const isGroupPending = (group) => normalizeStatus(group?.bookingStatus) === "pending";
const isGroupConfirmed = (group) => normalizeStatus(group?.bookingStatus) === "confirmed";
const isGroupReturned = (group) => normalizeStatus(group?.bookingStatus) === "returned";
const isGroupCancelled = (group) => ["cancelled", "failed"].includes(normalizeStatus(group?.bookingStatus));
const isGroupPaid = (group) =>
  group?.settlementStatus === "paid" ||
  normalizeStatus(group?.paymentLabel) === "paid" ||
  normalizeStatus(group?.paymentLabel) === "fully-paid" ||
  Number(group?.balanceAmount || 0) <= 0;

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
};

const safeText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const openPrintWindow = (title, bodyHtml) => {
  const printWindow = window.open("", "_blank", "width=950,height=750");
  if (!printWindow) {
    alert("Popup blocked. Allow popups to print bills.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${safeText(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
          h1, h2, h3 { margin: 0 0 10px; }
          .muted { color: #6b7280; font-size: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 18px 0; }
          .line { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #e5e7eb; padding: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
          th { background: #f3f4f6; }
          .total { margin-top: 18px; max-width: 360px; margin-left: auto; }
          .brand { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #0f3466; padding-bottom: 14px; margin-bottom: 18px; }
          .print-note { margin-top: 28px; font-size: 12px; color: #6b7280; }
          @media print { button { display:none; } body { margin: 20px; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding:10px 16px;margin-bottom:16px;background:#0f3466;color:white;border:0;border-radius:8px;cursor:pointer;">Print</button>
        ${bodyHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
};

const printBookingBill = (group) => {
  const rows = (group.items || [])
    .map(
      (item) => `
        <tr>
          <td>${safeText(item.productName)}</td>
          <td>${safeText(item.productId)}</td>
          <td>${safeText(item.quantity)}</td>
          <td>${safeText(item.days)}</td>
          <td>${money(item.totalAmount)}</td>
        </tr>`
    )
    .join("");

  openPrintWindow(
    `QuickRent Bill ${group.bookingReference || group.groupKey}`,
    `
      <div class="brand">
        <div>
          <h1>QuickRent</h1>
          <p class="muted">Rental booking bill</p>
        </div>
        <div style="text-align:right">
          <h3>${safeText(group.bookingReference || group.groupKey)}</h3>
          <p class="muted">Printed: ${new Date().toLocaleString("en-LK")}</p>
        </div>
      </div>
      <div class="grid">
        <div><strong>Customer:</strong> ${safeText(group.customerName)}</div>
        <div><strong>Email:</strong> ${safeText(group.gmail)}</div>
        <div><strong>Contact:</strong> ${safeText(group.contactNumber)}</div>
        <div><strong>NIC:</strong> ${safeText(group.nic)}</div>
        <div><strong>Start:</strong> ${shortDate(group.startDate)}</div>
        <div><strong>End:</strong> ${shortDate(group.endDate)}</div>
        <div style="grid-column:1 / -1"><strong>Address:</strong> ${safeText(group.address || "")}, ${safeText(group.city || "")}, ${safeText(group.province || "")}</div>
      </div>
      <table>
        <thead><tr><th>Product</th><th>ID</th><th>Qty</th><th>Days</th><th>Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">
        <div class="line"><span>Total</span><strong>${money(group.totalAmount)}</strong></div>
        <div class="line"><span>Advance Paid</span><strong>${money(group.advancePaid)}</strong></div>
        <div class="line"><span>Balance</span><strong>${money(group.balanceAmount)}</strong></div>
        <div class="line"><span>Payment Status</span><strong>${safeText(group.paymentLabel || group.paymentStatus)}</strong></div>
      </div>
      <p class="print-note">This bill was generated from the QuickRent admin dashboard.</p>
    `
  );
};

const printMonthlyHistory = (monthLabel, orders) => {
  const rows = orders
    .map(
      (group) => `
        <tr>
          <td>${safeText(group.bookingReference || group.groupKey)}</td>
          <td>${safeText(group.customerName)}</td>
          <td>${safeText((group.items || []).map((item) => `${item.productName} x ${item.quantity}`).join(", "))}</td>
          <td>${money(group.totalAmount)}</td>
          <td>${money(group.advancePaid)}</td>
          <td>${money(group.balanceAmount)}</td>
          <td>${safeText(group.bookingStatus)}</td>
        </tr>`
    )
    .join("");

  const total = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const advance = orders.reduce((sum, order) => sum + Number(order.advancePaid || 0), 0);
  const balance = orders.reduce((sum, order) => sum + Number(order.balanceAmount || 0), 0);

  openPrintWindow(
    `QuickRent Monthly Orders ${monthLabel}`,
    `
      <div class="brand">
        <div>
          <h1>QuickRent</h1>
          <p class="muted">Monthly booking history</p>
        </div>
        <div style="text-align:right">
          <h3>${safeText(monthLabel)}</h3>
          <p class="muted">Printed: ${new Date().toLocaleString("en-LK")}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Reference</th><th>Customer</th><th>Products</th><th>Total</th><th>Advance</th><th>Balance</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7">No orders found</td></tr>`}</tbody>
      </table>
      <div class="total">
        <div class="line"><span>Total Orders</span><strong>${orders.length}</strong></div>
        <div class="line"><span>Total Amount</span><strong>${money(total)}</strong></div>
        <div class="line"><span>Advance Collected</span><strong>${money(advance)}</strong></div>
        <div class="line"><span>Balance Pending</span><strong>${money(balance)}</strong></div>
      </div>
    `
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin] = useState(readAdmin);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState(null);
  const [bookingGroups, setBookingGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [returnBooking, setReturnBooking] = useState(null);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [onSiteForm, setOnSiteForm] = useState(emptyOnSiteForm);

  const headers = useMemo(
    () => ({
      "x-user-id": admin?._id || "",
    }),
    [admin]
  );

  const api = useMemo(
    () => ({
      get: (url) => axios.get(`${API_URL}${url}`, { headers }),
      post: (url, body) => axios.post(`${API_URL}${url}`, body, { headers }),
      put: (url, body) => axios.put(`${API_URL}${url}`, body, { headers }),
      delete: (url) => axios.delete(`${API_URL}${url}`, { headers }),
    }),
    [headers]
  );

  const loadAll = async () => {
    if (!admin) return;

    setLoading(true);
    setError("");

    try {
      const [overviewRes, bookingsRes, productsRes, usersRes, categoriesRes] = await Promise.all([
        api.get("/api/admin/overview"),
        api.get("/api/admin/bookings/grouped"),
        api.get("/api/admin/products"),
        api.get("/api/admin/users"),
        api.get("/api/admin/categories"),
      ]);

      setOverview(overviewRes.data);
      setBookingGroups(bookingsRes.data || []);
      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
      setCategories(categoriesRes.data || []);

      if (overviewRes.data?.revenueMonths?.length) {
        const exists = overviewRes.data.revenueMonths.some((month) => month.key === selectedMonth);
        if (!exists) setSelectedMonth(overviewRes.data.revenueMonths[0].key);
      }
    } catch (err) {
      console.log("ADMIN LOAD ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Admin dashboard failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      navigate("/");
      return;
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, navigate]);

  const filteredBookingGroups = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return bookingGroups;

    return bookingGroups.filter((group) =>
      [
        group.groupKey,
        group.bookingReference,
        group.customerName,
        group.gmail,
        group.bookingStatus,
        group.paymentLabel,
        ...(group.items || []).map((item) => `${item.productName} ${item.productId}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [bookingGroups, search]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;

    return products.filter((product) =>
      [product.product_id, product.name, product.description, product.category_id]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [products, search]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return users;

    return users.filter((user) =>
      [user.fullName, user.email, user.contactNumber, user.nic, user.role]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [users, search]);

  const selectedOnSiteProduct = useMemo(
    () => products.find((product) => product._id === onSiteForm.productMongoId),
    [products, onSiteForm.productMongoId]
  );

  const onSiteDays = calculateDays(onSiteForm.startDate, onSiteForm.endDate);
  const onSiteTotal = selectedOnSiteProduct
    ? Number(selectedOnSiteProduct.pricePerDay || 0) * Number(onSiteForm.quantity || 1) * onSiteDays
    : 0;

  const selectedMonthOrders = useMemo(
    () => bookingGroups.filter((group) => getMonthKey(group.createdAt || group.startDate) === selectedMonth),
    [bookingGroups, selectedMonth]
  );

  const selectedMonthLabel = useMemo(() => {
    const match = overview?.revenueMonths?.find((month) => month.key === selectedMonth);
    return match?.label || selectedMonth;
  }, [overview, selectedMonth]);

  const selectedMonthChart = overview?.revenueDaily?.[selectedMonth] || [];

  const refreshAfterAction = async () => {
    await loadAll();
  };

  const updateGroupStatus = async (groupKey, bookingStatus) => {
    try {
      await api.put(`/api/admin/bookings/groups/${encodeURIComponent(groupKey)}/status`, { bookingStatus });
      await refreshAfterAction();
    } catch (err) {
      console.log("GROUP STATUS ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Booking status update failed");
    }
  };

  const markBalancePaid = async (group) => {
    if (isGroupCancelled(group) || isGroupReturned(group)) {
      alert("This booking is already closed.");
      return;
    }

    if (!isGroupConfirmed(group)) {
      alert("Confirm product handover first. Then collect the balance payment.");
      return;
    }

    const balance = Number(group.balanceAmount || 0);
    const message = balance > 0
      ? `Mark balance ${money(balance)} as paid for ${group.bookingReference || group.groupKey}?`
      : `Mark this booking as fully paid?`;

    if (!window.confirm(message)) return;

    try {
      const res = await api.put(`/api/admin/bookings/groups/${encodeURIComponent(group.groupKey)}/settle`, {
        paymentStatus: "Paid",
      });

      await refreshAfterAction();

      const paidGroup = res.data?.group || {
        ...group,
        paymentLabel: "Paid",
        settlementStatus: "paid",
        balanceAmount: 0,
        items: (group.items || []).map((item) => ({
          ...item,
          paymentStatus: "Paid",
          balancePaid: true,
        })),
      };

      if (window.confirm("Payment is settled. Do you want to open the returned product check now?")) {
        setReturnBooking(paidGroup);
      }
    } catch (err) {
      console.log("SETTLE PAYMENT ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Payment update failed");
    }
  };

  const handleReturnSubmit = async (group, returnItems) => {
    try {
      await api.post(`/api/admin/bookings/groups/${encodeURIComponent(group.groupKey)}/return`, {
        items: returnItems,
      });
      setReturnBooking(null);
      await refreshAfterAction();
      alert("Return completed successfully");
    } catch (err) {
      console.log("RETURN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Return process failed");
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...productForm,
      pricePerDay: Number(productForm.pricePerDay),
      category_id: Number(productForm.category_id),
      available: Number(productForm.available),
      damaged: Number(productForm.damaged || 0),
    };

    try {
      if (editingProductId) {
        await api.put(`/api/admin/products/${editingProductId}`, payload);
      } else {
        await api.post("/api/admin/products", payload);
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadAll();
    } catch (err) {
      console.log("PRODUCT SAVE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Product save failed");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      product_id: product.product_id || "",
      name: product.name || "",
      description: product.description || "",
      pricePerDay: product.pricePerDay || "",
      category_id: product.category_id || "",
      image: product.image || "",
      available: product.available || "",
      damaged: product.damaged || "",
    });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/api/admin/products/${productId}`);
      await loadAll();
    } catch (err) {
      console.log("PRODUCT DELETE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Product delete failed");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...categoryForm,
      category_id: Number(categoryForm.category_id),
    };

    try {
      if (editingCategoryId) {
        await api.put(`/api/admin/categories/${editingCategoryId}`, payload);
      } else {
        await api.post("/api/admin/categories", payload);
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadAll();
    } catch (err) {
      console.log("CATEGORY SAVE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Category save failed");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      category_id: category.category_id || "",
      name: category.name || "",
      description: category.description || "",
    });
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/api/admin/categories/${categoryId}`);
      await loadAll();
    } catch (err) {
      console.log("CATEGORY DELETE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Category delete failed");
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role });
      await loadAll();
    } catch (err) {
      console.log("USER ROLE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Role update failed");
    }
  };

  const handleOnSiteSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOnSiteProduct) {
      alert("Please select a product");
      return;
    }

    setSaving(true);

    try {
      await api.post("/api/admin/bookings/on-site", {
        ...onSiteForm,
        days: onSiteDays,
        totalAmount: onSiteTotal,
      });

      setOnSiteForm(emptyOnSiteForm);
      await loadAll();
      setActiveTab("bookings");
      alert("On site booking created. It is pending until admin confirms and collects payment.");
    } catch (err) {
      console.log("ON SITE BOOKING ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "On site booking failed");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("quickrent_admin");
    localStorage.removeItem("user");
    navigate("/");
  };

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    setSearch("");
    setSidebarOpen(false);
  };

  if (!admin) return null;

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div>
            <img src={assets.logo} alt="" />
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`admin-nav-link ${activeTab === item.id ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div>{initials(admin.fullName)}</div>
            <span>
              <strong>{admin.fullName || "Admin"}</strong>
              <small>{admin.email}</small>
            </span>
          </div>
          <button type="button" onClick={logout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button type="button" className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
      )}

      <main className="admin-main">
        <TopBar
          admin={admin}
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          refresh={loadAll}
          pendingCount={overview?.stats?.pendingBookings || 0}
        />

        {error && <div className="admin-error">{error}. Check backend and admin routes.</div>}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                overview={overview}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedMonthChart={selectedMonthChart}
                selectedMonthOrders={selectedMonthOrders}
                selectedMonthLabel={selectedMonthLabel}
                showOrderHistory={showOrderHistory}
                setShowOrderHistory={setShowOrderHistory}
                setActiveTab={setActiveTab}
                setSelectedBooking={setSelectedBooking}
                markBalancePaid={markBalancePaid}
                setReturnBooking={setReturnBooking}
              />
            )}

            {activeTab === "bookings" && (
              <BookingsView
                bookings={filteredBookingGroups}
                search={search}
                setSearch={setSearch}
                setSelectedBooking={setSelectedBooking}
                updateGroupStatus={updateGroupStatus}
                markBalancePaid={markBalancePaid}
                setReturnBooking={setReturnBooking}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryView
                products={filteredProducts}
                categories={categories}
                search={search}
                setSearch={setSearch}
                productForm={productForm}
                setProductForm={setProductForm}
                editingProductId={editingProductId}
                setEditingProductId={setEditingProductId}
                handleProductSubmit={handleProductSubmit}
                editProduct={editProduct}
                deleteProduct={deleteProduct}
                categoryForm={categoryForm}
                setCategoryForm={setCategoryForm}
                editingCategoryId={editingCategoryId}
                setEditingCategoryId={setEditingCategoryId}
                handleCategorySubmit={handleCategorySubmit}
                editCategory={editCategory}
                deleteCategory={deleteCategory}
                saving={saving}
              />
            )}

            {activeTab === "customers" && (
              <CustomersView
                users={filteredUsers}
                search={search}
                setSearch={setSearch}
                updateUserRole={updateUserRole}
              />
            )}

            {activeTab === "onsite" && (
              <OnSiteBookingView
                products={products}
                form={onSiteForm}
                setForm={setOnSiteForm}
                selectedProduct={selectedOnSiteProduct}
                days={onSiteDays}
                total={onSiteTotal}
                handleSubmit={handleOnSiteSubmit}
                saving={saving}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView
                overview={overview}
                bookingGroups={bookingGroups}
                products={products}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedMonthLabel={selectedMonthLabel}
                selectedMonthOrders={selectedMonthOrders}
              />
            )}
          </>
        )}
      </main>

      {selectedBooking && (
        <BookingDetailsModal
          group={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          updateGroupStatus={updateGroupStatus}
          markBalancePaid={markBalancePaid}
          setReturnBooking={setReturnBooking}
        />
      )}

      {returnBooking && (
        <ReturnModal
          group={returnBooking}
          onClose={() => setReturnBooking(null)}
          onSubmit={handleReturnSubmit}
        />
      )}
    </div>
  );
};

const TopBar = ({ admin, activeTab, setSidebarOpen, refresh, pendingCount }) => {
  const title = NAV_ITEMS.find((item) => item.id === activeTab)?.label || "Dashboard";

  return (
    <div className="admin-topbar">
      <div className="admin-title-row">
        <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <div>
          <h1>{title}</h1>
          <p>Welcome back, {admin.fullName || "Admin"}</p>
        </div>
      </div>

      <div className="admin-top-actions">
        <button type="button" onClick={refresh} className="admin-btn admin-btn-light">
          Refresh
        </button>
        <div className="admin-date-chip">{new Date().toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        <div className="admin-bell">
          <AiFillBell size={25}/>
          {pendingCount > 0 && <span>{pendingCount}</span>}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="admin-loading-grid">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="admin-card admin-skeleton" />
    ))}
  </div>
);

const DashboardView = ({
  overview,
  selectedMonth,
  setSelectedMonth,
  selectedMonthChart,
  selectedMonthOrders,
  selectedMonthLabel,
  showOrderHistory,
  setShowOrderHistory,
  setActiveTab,
  setSelectedBooking,
  markBalancePaid,
  setReturnBooking,
}) => {
  const stats = overview?.stats || {};
  const mainCards = [
    { label: "Total Revenue", value: money(stats.totalRevenue), hint: "Collected amount", icon: assets.revenue },
    { label: "Pending Payments", value: money(stats.pendingPayment), hint: "Balance to collect", icon: assets.pamount },
    { label: "Bookings", value: stats.totalBookingGroups || 0, hint: "Grouped orders", icon: assets.booking},
    { label: "Available Stock", value: stats.equipmentAvailable || 0, hint: `${stats.damagedStock || 0} damaged`, icon: assets.available },
  ];

  return (
    <div className="admin-dashboard-space">
      <div className="admin-stat-grid clean">
        {mainCards.map((card) => (
          <button
            key={card.label}
            type="button"
            className="admin-stat-card"
            onClick={() => {
              if (card.label === "Bookings") setActiveTab("bookings");
              if (card.label === "Pending Payments") setActiveTab("bookings");
            }}
          >
            <img className="admin-stat-icon" src={card.icon} ></img>
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.hint}</small>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card admin-chart-card">
          <div className="admin-card-head">
            <div>
              <h3>Revenue Chart</h3>
              <p>Select a month and view daily collected revenue.</p>
            </div>
            <MonthSelect months={overview?.revenueMonths || []} value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <BarChart data={selectedMonthChart} formatter={money} />
        </div>

        <button type="button" className="admin-card admin-history-card" onClick={() => setShowOrderHistory((prev) => !prev)}>
          <span>Order History</span>
          <strong>{selectedMonthOrders.length}</strong>
          <small>{selectedMonthLabel}</small>
          <em>Click to {showOrderHistory ? "hide" : "view"} monthly bookings</em>
        </button>
      </div>

      {showOrderHistory && (
        <div className="admin-card admin-section-card">
          <div className="admin-card-head">
            <div>
              <h3>Order History · {selectedMonthLabel}</h3>
              <p>Print one bill or the full monthly booking history.</p>
            </div>
            <button type="button" className="admin-btn admin-btn-dark" onClick={() => printMonthlyHistory(selectedMonthLabel, selectedMonthOrders)}>
              Print Monthly History
            </button>
          </div>
          <BookingGroupsTable
            bookings={selectedMonthOrders}
            setSelectedBooking={setSelectedBooking}
            markBalancePaid={markBalancePaid}
            setReturnBooking={setReturnBooking}
            compact
          />
        </div>
      )}

      <div className="admin-card admin-section-card">
        <div className="admin-card-head">
          <div>
            <h3>Recent Bookings</h3>
            <p>Grouped by the same booking reference, so cart orders stay together.</p>
          </div>
          <button type="button" className="admin-btn admin-btn-light" onClick={() => setActiveTab("bookings")}>View all</button>
        </div>
        <BookingGroupsTable
          bookings={overview?.recentBookingGroups || []}
          setSelectedBooking={setSelectedBooking}
          markBalancePaid={markBalancePaid}
          setReturnBooking={setReturnBooking}
          compact
        />
      </div>
    </div>
  );
};

const MonthSelect = ({ months, value, onChange }) => (
  <select className="admin-select month-select" value={value} onChange={(e) => onChange(e.target.value)}>
    {months.length ? (
      months.map((month) => (
        <option key={month.key} value={month.key}>{month.label}</option>
      ))
    ) : (
      <option value={value}>{value}</option>
    )}
  </select>
);

const BarChart = ({ data = [], formatter }) => {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  if (!data.length) {
    return <div className="admin-empty-small">No revenue data for this month</div>;
  }

  return (
    <div className="admin-bars-clean">
      {data.map((item) => {
        const height = Math.max((Number(item.value || 0) / max) * 100, item.value > 0 ? 12 : 4);
        return (
          <div key={item.label} className="admin-bar-wrap-clean" title={`${item.label}: ${formatter ? formatter(item.value) : item.value}`}>
            <div className="admin-bar-clean" style={{ height: `${height}%` }} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const BookingsView = ({ bookings, search, setSearch, setSelectedBooking, updateGroupStatus, markBalancePaid, setReturnBooking, setActiveTab }) => (
  <div className="admin-card admin-section-card">
    <SectionHeader
      title="Bookings"
      subtitle="All shop bookings, grouped by booking reference for easy billing."
      search={search}
      setSearch={setSearch}
      buttonText="+ On Site Booking"
      onButton={() => setActiveTab("onsite")}
    />
    <BookingGroupsTable
      bookings={bookings}
      setSelectedBooking={setSelectedBooking}
      updateGroupStatus={updateGroupStatus}
      markBalancePaid={markBalancePaid}
      setReturnBooking={setReturnBooking}
    />
  </div>
);

const BookingGroupsTable = ({ bookings, setSelectedBooking, updateGroupStatus, markBalancePaid, setReturnBooking, compact = false }) => {
  if (!bookings.length) return <EmptyBlock text="No bookings found" />;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Manage</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((group) => {
            const paid = isGroupPaid(group);
            const pending = isGroupPending(group);
            const confirmed = isGroupConfirmed(group);
            const returned = isGroupReturned(group);
            const cancelled = isGroupCancelled(group);

            return (
              <tr key={group.groupKey}>
                <td>
                  <strong className="admin-ref">{group.bookingReference || group.groupKey}</strong>
                  <small>{shortDate(group.createdAt)}</small>
                </td>
                <td>
                  <strong>{group.customerName}</strong>
                  <small>{group.gmail}</small>
                </td>
                <td>
                  <div className="admin-product-stack">
                    {(group.items || []).map((item) => (
                      <span key={item._id}>{item.productName} × {item.quantity}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <strong>{money(group.totalAmount)}</strong>
                  <small>Advance: {money(group.advancePaid)}</small>
                  <small>Balance: {money(group.balanceAmount)}</small>
                  <span className={statusClass(group.paymentLabel)}>{group.paymentLabel || group.paymentStatus}</span>
                </td>
                <td>
                  <span className={statusClass(group.bookingStatus)}>{group.bookingStatus}</span>
                  <small className="admin-flow-note">
                    {pending && "waiting for handover"}
                    {confirmed && !paid && "collect balance"}
                    {confirmed && paid && "ready to return"}
                    {returned && "return completed"}
                    {cancelled && "closed"}
                  </small>
                </td>
                <td>
                  <div className={`admin-action-stack ${compact ? "compact-actions" : ""}`}>
                    <button type="button" className="admin-btn admin-btn-light" onClick={() => setSelectedBooking(group)}>View</button>

                    {updateGroupStatus && pending && (
                      <>
                        <button type="button" className="admin-btn admin-btn-green" onClick={() => updateGroupStatus(group.groupKey, "Confirmed")}>Confirm Handover</button>
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => updateGroupStatus(group.groupKey, "Cancelled")}>Cancel</button>
                      </>
                    )}

                    {confirmed && !paid && (
                      <button type="button" className="admin-btn admin-btn-dark" onClick={() => markBalancePaid(group)}>Mark Balance Paid</button>
                    )}

                    {confirmed && paid && (
                      <button type="button" className="admin-btn admin-btn-blue" onClick={() => setReturnBooking(group)}>Returned</button>
                    )}

                    {returned && <span className="admin-status admin-status-returned">Closed</span>}
                    {cancelled && <span className="admin-status admin-status-cancelled">No action</span>}
                  </div>
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn-print" onClick={() => printBookingBill(group)}>Print Bill</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const InventoryView = ({
  products,
  categories,
  search,
  setSearch,
  productForm,
  setProductForm,
  editingProductId,
  setEditingProductId,
  handleProductSubmit,
  editProduct,
  deleteProduct,
  categoryForm,
  setCategoryForm,
  editingCategoryId,
  setEditingCategoryId,
  handleCategorySubmit,
  editCategory,
  deleteCategory,
  saving,
}) => (
  <div className="admin-inventory-grid">
    <div className="admin-card admin-form-card">
      <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
      <p>Manage equipment and stock.</p>
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
        <input className="admin-input wide" placeholder="Image URL or file name" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
        <div className="wide admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-dark" disabled={saving}>{saving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}</button>
          {editingProductId && <button type="button" className="admin-btn admin-btn-light" onClick={() => { setEditingProductId(null); setProductForm(emptyProductForm); }}>Clear</button>}
        </div>
      </form>
    </div>

    <div className="admin-card admin-section-card">
      <SectionHeader title="Inventory" subtitle="Products, available stock and damaged stock." search={search} setSearch={setSearch} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td><strong>{product.name}</strong><small>ID: {product.product_id}</small></td>
                <td>{product.category_id}</td>
                <td>{money(product.pricePerDay)}</td>
                <td><span className="admin-status admin-status-confirmed">{product.available || 0} available</span><span className="admin-status admin-status-damaged ml-2">{product.damaged || 0} damaged</span></td>
                <td><div className="admin-action-stack horizontal"><button type="button" className="admin-btn admin-btn-light" onClick={() => editProduct(product)}>Edit</button><button type="button" className="admin-btn admin-btn-danger" onClick={() => deleteProduct(product._id)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <EmptyBlock text="No products found" />}
      </div>
    </div>

    <div className="admin-card admin-section-card wide-card">
      <div className="admin-card-head"><div><h3>Categories</h3><p>Add or edit rental categories.</p></div></div>
      <form onSubmit={handleCategorySubmit} className="admin-category-row">
        <input className="admin-input" type="number" placeholder="Category ID" value={categoryForm.category_id} onChange={(e) => setCategoryForm({ ...categoryForm, category_id: e.target.value })} required />
        <input className="admin-input" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
        <input className="admin-input" placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
        <button type="submit" className="admin-btn admin-btn-dark" disabled={saving}>{editingCategoryId ? "Update" : "Add"}</button>
        {editingCategoryId && <button type="button" className="admin-btn admin-btn-light" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategoryForm); }}>Clear</button>}
      </form>
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

const CustomersView = ({ users, search, setSearch, updateUserRole }) => (
  <div className="admin-card admin-section-card">
    <SectionHeader title="Customers" subtitle="View all users and change admin access." search={search} setSearch={setSearch} />
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>NIC</th><th>Role</th></tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td><strong>{user.fullName}</strong><small>{user.isActive ? "Active" : "Offline"}</small></td>
              <td>{user.email}</td>
              <td>{user.contactNumber}</td>
              <td>{user.nic}</td>
              <td><select className="admin-select mini" value={user.role || "user"} onChange={(e) => updateUserRole(user._id, e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!users.length && <EmptyBlock text="No users found" />}
    </div>
  </div>
);

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

const ReportsView = ({ overview, bookingGroups, products, selectedMonth, setSelectedMonth, selectedMonthLabel, selectedMonthOrders }) => (
  <div className="admin-dashboard-space">
    <div className="admin-stat-grid clean">
      <div className="admin-stat-card"><div className="admin-stat-icon">💰</div><div><span>Total Revenue</span><strong>{money(overview?.stats?.totalRevenue)}</strong><small>Collected</small></div></div>
      <div className="admin-stat-card"><div className="admin-stat-icon">⏳</div><div><span>Pending Payment</span><strong>{money(overview?.stats?.pendingPayment)}</strong><small>Balance</small></div></div>
      <div className="admin-stat-card"><div className="admin-stat-icon">⚠</div><div><span>Damaged Stock</span><strong>{overview?.stats?.damagedStock || 0}</strong><small>Need check</small></div></div>
      <div className="admin-stat-card"><div className="admin-stat-icon">📄</div><div><span>Orders</span><strong>{bookingGroups.length}</strong><small>Grouped</small></div></div>
    </div>

    <div className="admin-card admin-section-card">
      <div className="admin-card-head">
        <div><h3>Monthly Order Printout</h3><p>Select a month and print predicted/full booking history.</p></div>
        <div className="admin-head-actions">
          <MonthSelect months={overview?.revenueMonths || []} value={selectedMonth} onChange={setSelectedMonth} />
          <button type="button" className="admin-btn admin-btn-dark" onClick={() => printMonthlyHistory(selectedMonthLabel, selectedMonthOrders)}>Print Monthly</button>
        </div>
      </div>
      <BookingGroupsTable bookings={selectedMonthOrders} setSelectedBooking={() => {}} markBalancePaid={() => {}} setReturnBooking={() => {}} compact />
    </div>

    <div className="admin-card admin-section-card">
      <div className="admin-card-head"><div><h3>Damaged Stock</h3><p>Products moved to damaged stock after return confirmation.</p></div></div>
      <div className="admin-chip-list">
        {products.filter((product) => Number(product.damaged || 0) > 0).map((product) => (
          <span key={product._id} className="admin-category-chip damaged">{product.name}: {product.damaged}</span>
        ))}
      </div>
      {!products.some((product) => Number(product.damaged || 0) > 0) && <EmptyBlock text="No damaged stock" />}
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, search, setSearch, buttonText, onButton }) => (
  <div className="admin-card-head">
    <div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
    <div className="admin-head-actions">
      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input search" />
      {buttonText && <button type="button" onClick={onButton} className="admin-btn admin-btn-dark">{buttonText}</button>}
    </div>
  </div>
);

const BookingDetailsModal = ({ group, onClose, updateGroupStatus, markBalancePaid, setReturnBooking }) => (
  <div className="admin-modal-backdrop" onClick={onClose}>
    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
      <div className="admin-card-head">
        <div>
          <h3>Booking Details</h3>
          <p>{group.bookingReference || group.groupKey}</p>
        </div>
        <button type="button" className="admin-btn admin-btn-light" onClick={onClose}>Close</button>
      </div>

      <div className="admin-detail-grid">
        <SummaryLine label="Customer" value={group.customerName} />
        <SummaryLine label="Email" value={group.gmail} />
        <SummaryLine label="Contact" value={group.contactNumber} />
        <SummaryLine label="NIC" value={group.nic} />
        <SummaryLine label="Start Date" value={shortDate(group.startDate)} />
        <SummaryLine label="End Date" value={shortDate(group.endDate)} />
        <SummaryLine label="Address" value={`${group.address || ""}, ${group.city || ""}, ${group.province || ""}`} />
        <SummaryLine label="Total" value={money(group.totalAmount)} />
        <SummaryLine label="Advance Paid" value={money(group.advancePaid)} />
        <SummaryLine label="Balance" value={money(group.balanceAmount)} />
      </div>

      <div className="admin-table-wrap mt-4">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Amount</th><th>Return</th></tr></thead>
          <tbody>
            {(group.items || []).map((item) => (
              <tr key={item._id}><td><strong>{item.productName}</strong><small>{item.productId}</small></td><td>{item.quantity}</td><td>{money(item.totalAmount)}</td><td>{item.returnItems?.length ? "Processed" : "Not returned"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-modal-actions">
        {isGroupPending(group) && (
          <>
            <button type="button" className="admin-btn admin-btn-green" onClick={() => updateGroupStatus(group.groupKey, "Confirmed")}>Confirm Product Handover</button>
            <button type="button" className="admin-btn admin-btn-danger" onClick={() => updateGroupStatus(group.groupKey, "Cancelled")}>Cancel Booking</button>
          </>
        )}
        {isGroupConfirmed(group) && !isGroupPaid(group) && <button type="button" className="admin-btn admin-btn-dark" onClick={() => markBalancePaid(group)}>Mark Balance Paid</button>}
        {isGroupConfirmed(group) && isGroupPaid(group) && <button type="button" className="admin-btn admin-btn-blue" onClick={() => { onClose(); setReturnBooking(group); }}>Returned</button>}
        {isGroupReturned(group) && <span className="admin-status admin-status-returned">Return completed</span>}
        <button type="button" className="admin-btn admin-btn-print" onClick={() => printBookingBill(group)}>Print Bill</button>
      </div>
    </div>
  </div>
);

const ReturnModal = ({ group, onClose, onSubmit }) => {
  const [rows, setRows] = useState(() =>
    (group.items || []).map((item) => ({
      bookingId: item._id,
      productName: item.productName,
      quantity: Number(item.quantity || 0),
      totalAmount: Number(item.totalAmount || 0),
      goodQty: Number(item.quantity || 0),
      damagedQty: 0,
      damageReason: "",
      damageCost: 0,
    }))
  );

  const updateRow = (bookingId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.bookingId !== bookingId) return row;
        const next = { ...row, [field]: value };
        if (field === "goodQty") {
          const good = Math.min(Math.max(Number(value || 0), 0), row.quantity);
          next.goodQty = good;
          next.damagedQty = Math.max(row.quantity - good, 0);
        }
        if (field === "damagedQty") {
          const damaged = Math.min(Math.max(Number(value || 0), 0), row.quantity);
          next.damagedQty = damaged;
          next.goodQty = Math.max(row.quantity - damaged, 0);
        }
        return next;
      })
    );
  };

  const totalDamageCost = rows.reduce((sum, row) => sum + Number(row.damageCost || 0), 0);

  const submit = (e) => {
    e.preventDefault();

    for (const row of rows) {
      if (Number(row.goodQty || 0) + Number(row.damagedQty || 0) !== Number(row.quantity || 0)) {
        alert(`Good + damaged quantity must equal rented quantity for ${row.productName}`);
        return;
      }
      if (Number(row.damagedQty || 0) > 0 && !String(row.damageReason || "").trim()) {
        alert(`Add damage reason for ${row.productName}`);
        return;
      }
    }

    if (!window.confirm("Confirm return and update stock now?")) return;
    onSubmit(group, rows);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal-card wide-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="admin-card-head">
          <div>
            <h3>Return Confirmation</h3>
            <p>{group.customerName} · {group.gmail}</p>
          </div>
          <button type="button" className="admin-btn admin-btn-light" onClick={onClose}>Close</button>
        </div>

        <div className="admin-return-summary">
          <SummaryLine label="Customer" value={group.customerName} />
          <SummaryLine label="Email" value={group.gmail} />
          <SummaryLine label="Reference" value={group.bookingReference || group.groupKey} />
          <SummaryLine label="Total amount" value={money(group.totalAmount)} />
        </div>

        <div className="admin-return-help">
          Enter how many items came back in good condition and how many are damaged. Good items go back to available stock. Damaged items go to damaged stock and the damage cost is added to revenue.
        </div>

        <div className="admin-return-list">
          {rows.map((row) => (
            <div key={row.bookingId} className="admin-return-row">
              <div>
                <strong>{row.productName}</strong>
                <small>Booked quantity: {row.quantity}</small>
                <small>Amount: {money(row.totalAmount)}</small>
              </div>
              <label>Good<input className="admin-input" type="number" min="0" max={row.quantity} value={row.goodQty} onChange={(e) => updateRow(row.bookingId, "goodQty", e.target.value)} /></label>
              <label>Damaged<input className="admin-input" type="number" min="0" max={row.quantity} value={row.damagedQty} onChange={(e) => updateRow(row.bookingId, "damagedQty", e.target.value)} /></label>
              <label>Damage cost<input className="admin-input" type="number" min="0" value={row.damageCost} onChange={(e) => updateRow(row.bookingId, "damageCost", e.target.value)} /></label>
              <label className="reason">Reason<input className="admin-input" placeholder="Reason if damaged" value={row.damageReason} onChange={(e) => updateRow(row.bookingId, "damageReason", e.target.value)} /></label>
            </div>
          ))}
        </div>

        <div className="admin-total-line"><span>Total damage cost</span><strong>{money(totalDamageCost)}</strong></div>
        <button type="submit" className="admin-btn admin-btn-dark w-full">Confirm Return</button>
      </form>
    </div>
  );
};

const SummaryLine = ({ label, value }) => (
  <div className="admin-summary-line"><span>{label}</span><strong>{value || "-"}</strong></div>
);

const EmptyBlock = ({ text }) => <div className="admin-empty-block">{text}</div>;

export default AdminDashboard;
