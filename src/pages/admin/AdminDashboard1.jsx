import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "bookings", label: "Bookings", icon: "▣" },
  { id: "products", label: "Products", icon: "□" },
  { id: "categories", label: "Categories", icon: "◇" },
  { id: "customers", label: "Customers", icon: "◉" },
  { id: "payments", label: "Payments", icon: "◍" },
  { id: "income", label: "Income", icon: "⌁" },
  { id: "reports", label: "Reports", icon: "◒" },
  { id: "notifications", label: "Notifications", icon: "◌" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "reviews", label: "Reviews", icon: "★" },
  { id: "onsite", label: "On Site Bookings", icon: "⌖" },
  { id: "settings", label: "Settings", icon: "⚙" },
  { id: "profile", label: "Profile", icon: "●" },
];

const emptyProductForm = {
  product_id: "",
  name: "",
  description: "",
  pricePerDay: "",
  category_id: "",
  image: "",
  available: "",
};

const emptyCategoryForm = {
  category_id: "",
  name: "",
  description: "",
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
  paymentStatus: "Paid",
  bookingStatus: "Confirmed",
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

const initials = (name = "Admin") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "AD";

const statusClass = (status) =>
  `admin-status admin-status-${String(status || "pending").toLowerCase()}`;

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
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
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      const [overviewRes, bookingsRes, productsRes, usersRes, categoriesRes, messagesRes, reviewsRes] =
        await Promise.all([
          api.get("/api/admin/overview"),
          api.get("/api/admin/bookings"),
          api.get("/api/admin/products"),
          api.get("/api/admin/users"),
          api.get("/api/admin/categories"),
          api.get("/api/admin/messages"),
          api.get("/api/admin/reviews"),
        ]);

      setOverview(overviewRes.data);
      setBookings(bookingsRes.data || []);
      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
      setCategories(categoriesRes.data || []);
      setMessages(messagesRes.data || []);
      setReviews(reviewsRes.data || []);
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

  const filteredBookings = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return bookings;

    return bookings.filter((booking) =>
      [
        booking.bookingReference,
        booking.customerName,
        booking.gmail,
        booking.productName,
        booking.bookingStatus,
        booking.paymentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [bookings, search]);

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

  const filteredCategories = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return categories;

    return categories.filter((category) =>
      [category.category_id, category.name, category.description]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [categories, search]);

  const selectedOnSiteProduct = useMemo(
    () => products.find((product) => product._id === onSiteForm.productMongoId),
    [products, onSiteForm.productMongoId]
  );

  const onSiteDays = calculateDays(onSiteForm.startDate, onSiteForm.endDate);
  const onSiteTotal = selectedOnSiteProduct
    ? Number(selectedOnSiteProduct.pricePerDay || 0) * Number(onSiteForm.quantity || 1) * onSiteDays
    : 0;

  const updateBookingStatus = async (bookingId, field, value) => {
    try {
      const payload = field === "bookingStatus" ? { bookingStatus: value } : { paymentStatus: value };
      const res = await api.put(`/api/admin/bookings/${bookingId}/status`, payload);

      setBookings((prev) => prev.map((item) => (item._id === bookingId ? res.data : item)));
      await loadOverviewOnly();
    } catch (err) {
      console.log("BOOKING UPDATE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Booking update failed");
    }
  };

  const loadOverviewOnly = async () => {
    try {
      const res = await api.get("/api/admin/overview");
      setOverview(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
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
      setActiveTab("products");
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
    });
    setActiveTab("products");
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
      setActiveTab("categories");
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
      const res = await api.put(`/api/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((item) => (item._id === userId ? res.data : item)));
      await loadOverviewOnly();
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
      alert("On site booking created successfully");
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
      <div className="flex min-h-screen">
        <aside
          className={`admin-sidebar ${sidebarOpen ? "open" : ""} admin-glass w-[270px] h-screen flex-shrink-0 p-5 flex flex-col overflow-y-auto admin-scrollbar-hide`}
        >
          <div className="flex items-center gap-3 text-2xl font-extrabold text-[#0a254a] mb-8">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f3466] to-[#3a6bb5] text-white flex items-center justify-center shadow-lg">
              Q
            </span>
            <span className="bg-gradient-to-r from-[#0a254a] to-[#3a6bb5] bg-clip-text text-transparent">
              QuickRent
            </span>
          </div>

          <nav className="flex-1 space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                className={`admin-sidebar-link ${activeTab === item.id ? "active" : ""}`}
              >
                <span className="w-5 text-[#3a6bb5] font-black">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/40">
            <button
              type="button"
              onClick={logout}
              className="admin-sidebar-link text-red-600 hover:bg-red-50/60"
            >
              <span className="w-5">↳</span> Logout
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
        )}

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <TopBar
            admin={admin}
            activeTab={activeTab}
            setSidebarOpen={setSidebarOpen}
            notificationsCount={overview?.notifications?.length || 0}
            refresh={loadAll}
          />

          {error && (
            <div className="admin-card rounded-2xl p-4 mb-5 text-red-700 bg-red-50/70">
              {error}. Check whether backend is running on port 5000 and /api/admin is added in server.js.
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  overview={overview}
                  bookings={filteredBookings}
                  setSearch={setSearch}
                  search={search}
                  setActiveTab={setActiveTab}
                  setSelectedBooking={setSelectedBooking}
                  updateBookingStatus={updateBookingStatus}
                />
              )}

              {activeTab === "bookings" && (
                <BookingsView
                  bookings={filteredBookings}
                  search={search}
                  setSearch={setSearch}
                  setSelectedBooking={setSelectedBooking}
                  updateBookingStatus={updateBookingStatus}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "products" && (
                <ProductsView
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
                  saving={saving}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesView
                  categories={filteredCategories}
                  search={search}
                  setSearch={setSearch}
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

              {activeTab === "payments" && (
                <PaymentsView
                  bookings={filteredBookings}
                  search={search}
                  setSearch={setSearch}
                  updateBookingStatus={updateBookingStatus}
                />
              )}

              {activeTab === "income" && <IncomeView overview={overview} bookings={bookings} />}

              {activeTab === "reports" && <ReportsView overview={overview} products={products} bookings={bookings} />}

              {activeTab === "notifications" && <NotificationsView overview={overview} />}

              {activeTab === "messages" && <SimpleListView title="Messages" items={messages} empty="No messages collection is connected yet." />}

              {activeTab === "reviews" && <SimpleListView title="Reviews" items={reviews} empty="No reviews collection is connected yet." />}

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

              {activeTab === "settings" && <SettingsView apiUrl={API_URL} refresh={loadAll} logout={logout} />}

              {activeTab === "profile" && <ProfileView admin={admin} logout={logout} />}
            </>
          )}

          <div className="mt-8 text-xs text-[#3a6bb5]/55 text-center">
            © 2026 QuickRent · Premium Admin Dashboard
          </div>
        </main>
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          updateBookingStatus={updateBookingStatus}
        />
      )}
    </div>
  );
};

const TopBar = ({ admin, activeTab, setSidebarOpen, notificationsCount, refresh }) => {
  const title = NAV_ITEMS.find((item) => item.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex flex-wrap justify-between items-center mb-7 gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="admin-mobile-menu admin-btn admin-btn-soft"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0a254a] tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[#3a6bb5]/75">Welcome back, {admin.fullName || "Admin"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={refresh} className="admin-btn admin-btn-soft">
          Refresh
        </button>
        <div className="admin-glass rounded-full px-4 py-2 text-sm flex items-center gap-2 text-[#0f3466] shadow-sm">
          <span>◷</span>
          {new Date().toLocaleDateString("en-LK", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="relative">
          <span className="w-11 h-11 admin-glass rounded-full flex items-center justify-center text-[#0f3466] shadow-sm">
            ◌
          </span>
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </div>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3a6bb5] to-[#0f3466] flex items-center justify-center text-white font-bold shadow-md">
          {initials(admin.fullName)}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="admin-card rounded-3xl p-6 animate-pulse">
        <div className="h-4 bg-[#3a6bb5]/10 rounded w-1/2 mb-4" />
        <div className="h-8 bg-[#0f3466]/10 rounded w-2/3" />
      </div>
    ))}
  </div>
);

const DashboardView = ({ overview, bookings, search, setSearch, setActiveTab, setSelectedBooking, updateBookingStatus }) => {
  const stats = overview?.stats || {};
  const statCards = [
    { label: "Monthly Income", value: money(stats.monthlyIncome), icon: "💰", tone: "+ live" },
    { label: "Today's Income", value: money(stats.todayIncome), icon: "📅", tone: "today" },
    { label: "Annual Revenue", value: money(stats.annualRevenue), icon: "📈", tone: "year" },
    { label: "Total Products", value: stats.totalProducts || 0, icon: "📦", tone: "stock" },
    { label: "Total Bookings", value: stats.totalBookings || 0, icon: "📖", tone: "all" },
    { label: "Confirmed", value: stats.confirmedBookings || 0, icon: "✅", tone: "ok" },
    { label: "Pending", value: stats.pendingBookings || 0, icon: "⏳", tone: "watch" },
    { label: "Cancelled", value: stats.cancelledBookings || 0, icon: "❌", tone: "stop" },
    { label: "Total Users", value: stats.totalUsers || 0, icon: "👤", tone: "users" },
    { label: "Active Customers", value: stats.activeCustomers || 0, icon: "⭐", tone: "active" },
    { label: "Equipment Available", value: stats.equipmentAvailable || 0, icon: "🛠", tone: "ready" },
    { label: "Low Stock", value: stats.lowStock || 0, icon: "⚠️", tone: "check" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-7">
        {statCards.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <ChartCard title="Monthly Revenue" icon="📈">
          <BarChart data={overview?.monthlyRevenue || []} formatter={money} />
        </ChartCard>

        <ChartCard title="Booking Analytics" icon="📊">
          <BarChart data={overview?.bookingAnalytics || []} />
        </ChartCard>

        <ChartCard title="Booking Status" icon="🧩">
          <StatusDonut counts={overview?.statusCounts || {}} />
        </ChartCard>
      </div>

      <div className="admin-card rounded-3xl p-5 mb-6 overflow-x-auto">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h4 className="font-extrabold text-[#0a254a]">📋 Recent Bookings</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="admin-input !rounded-full !py-2 w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setActiveTab("onsite")}>
              + Add
            </button>
          </div>
        </div>
        <BookingsTable
          bookings={bookings.slice(0, 8)}
          setSelectedBooking={setSelectedBooking}
          updateBookingStatus={updateBookingStatus}
        />
        <div className="flex justify-between items-center mt-3 text-xs text-[#3a6bb5]/70">
          <span>Showing {Math.min(bookings.length, 8)} of {bookings.length}</span>
          <button type="button" onClick={() => setActiveTab("bookings")} className="font-bold">
            View all →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LatestUsers users={overview?.latestUsers || []} />
        <TopRented items={overview?.topRented || []} />
      </div>
    </>
  );
};

const StatCard = ({ stat }) => (
  <div className="admin-card rounded-3xl p-4 flex flex-col min-h-[118px]">
    <span className="text-xs font-bold text-[#3a6bb5]/80 flex items-center gap-2">
      <span className="text-lg">{stat.icon}</span> {stat.label}
    </span>
    <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a254a] mt-3">
      {stat.value}
    </span>
    <span className="text-[11px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-full w-fit mt-auto">
      {stat.tone}
    </span>
  </div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="admin-card rounded-3xl p-5">
    <h4 className="font-extrabold text-[#0a254a] text-sm mb-3">
      {icon} {title}
    </h4>
    {children}
  </div>
);

const BarChart = ({ data = [], formatter }) => {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  if (!data.length) {
    return <div className="h-[150px] flex items-center justify-center text-sm text-[#3a6bb5]/60">No data yet</div>;
  }

  return (
    <div className="admin-bars">
      {data.map((item) => {
        const height = Math.max((Number(item.value || 0) / max) * 100, 8);

        return (
          <div key={item.label} className="admin-bar-wrap">
            <span className="text-[10px] text-[#0a254a]/60 font-bold">
              {formatter ? formatter(item.value) : item.value}
            </span>
            <div className="admin-bar" style={{ height: `${height}%` }} title={`${item.label}: ${item.value}`} />
            <span className="text-[11px] text-[#3a6bb5]/70">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatusDonut = ({ counts = {} }) => {
  const pending = Number(counts.pending || 0);
  const confirmed = Number(counts.confirmed || 0);
  const returned = Number(counts.returned || 0);
  const cancelled = Number(counts.cancelled || 0);
  const total = pending + confirmed + returned + cancelled || 1;

  const confirmedEnd = (confirmed / total) * 100;
  const pendingEnd = confirmedEnd + (pending / total) * 100;
  const returnedEnd = pendingEnd + (returned / total) * 100;

  const style = {
    background: `conic-gradient(#10b981 0 ${confirmedEnd}%, #f59e0b ${confirmedEnd}% ${pendingEnd}%, #3b82f6 ${pendingEnd}% ${returnedEnd}%, #ef4444 ${returnedEnd}% 100%)`,
  };

  return (
    <div className="flex items-center gap-5 min-h-[150px]">
      <div className="admin-donut" style={style} />
      <div className="space-y-2 text-sm">
        <Legend color="bg-emerald-500" label="Confirmed" value={confirmed} />
        <Legend color="bg-amber-500" label="Pending" value={pending} />
        <Legend color="bg-blue-500" label="Returned" value={returned} />
        <Legend color="bg-red-500" label="Cancelled" value={cancelled} />
      </div>
    </div>
  );
};

const Legend = ({ color, label, value }) => (
  <div className="flex items-center gap-2 text-[#0a254a]/75">
    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const BookingsView = ({ bookings, search, setSearch, setSelectedBooking, updateBookingStatus, setActiveTab }) => (
  <div className="admin-card rounded-3xl p-5 overflow-x-auto">
    <SectionHeader
      title="Bookings"
      subtitle="Manage all online and on site rental bookings."
      search={search}
      setSearch={setSearch}
      buttonText="+ On Site Booking"
      onButton={() => setActiveTab("onsite")}
    />
    <BookingsTable
      bookings={bookings}
      setSelectedBooking={setSelectedBooking}
      updateBookingStatus={updateBookingStatus}
    />
  </div>
);

const BookingsTable = ({ bookings, setSelectedBooking, updateBookingStatus }) => {
  if (!bookings.length) {
    return <EmptyBlock text="No bookings found" />;
  }

  return (
    <table className="admin-table min-w-[980px]">
      <thead>
        <tr>
          <th>Reference</th>
          <th>Customer</th>
          <th>Equipment</th>
          <th>Dates</th>
          <th>Total</th>
          <th>Booking</th>
          <th>Payment</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking._id}>
            <td className="font-bold text-[#0f3466]">{booking.bookingReference || booking._id?.slice(-6)}</td>
            <td>
              <div className="font-bold">{booking.customerName}</div>
              <div className="text-xs text-[#3a6bb5]/70">{booking.gmail}</div>
            </td>
            <td>
              <div className="font-semibold">{booking.productName}</div>
              <div className="text-xs text-[#3a6bb5]/70">Qty {booking.quantity} · {booking.days} day(s)</div>
            </td>
            <td className="text-xs">
              {shortDate(booking.startDate)}<br />{shortDate(booking.endDate)}
            </td>
            <td className="font-bold">{money(booking.totalAmount)}</td>
            <td>
              <select
                className="admin-select !py-2"
                value={booking.bookingStatus || "Pending"}
                onChange={(e) => updateBookingStatus(booking._id, "bookingStatus", e.target.value)}
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Returned</option>
                <option>Cancelled</option>
              </select>
            </td>
            <td>
              <select
                className="admin-select !py-2"
                value={booking.paymentStatus || "Pending"}
                onChange={(e) => updateBookingStatus(booking._id, "paymentStatus", e.target.value)}
              >
                <option>Pending</option>
                <option>Paid</option>
                <option>Failed</option>
                <option>Cancelled</option>
              </select>
            </td>
            <td>
              <button type="button" onClick={() => setSelectedBooking(booking)} className="admin-btn admin-btn-soft !py-2">
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ProductsView = ({
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
  saving,
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-5">
    <div className="admin-card rounded-3xl p-5 h-fit">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">
        {editingProductId ? "Edit Product" : "Add Product"}
      </h3>
      <p className="text-sm text-[#3a6bb5]/70 mb-5">Create and update rental equipment from here.</p>

      <form onSubmit={handleProductSubmit} className="space-y-3">
        <input className="admin-input" placeholder="Product ID" value={productForm.product_id} onChange={(e) => setProductForm({ ...productForm, product_id: e.target.value })} />
        <input className="admin-input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
        <textarea className="admin-textarea" placeholder="Description" rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className="admin-input" type="number" placeholder="Price per day" value={productForm.pricePerDay} onChange={(e) => setProductForm({ ...productForm, pricePerDay: e.target.value })} required />
          <input className="admin-input" type="number" placeholder="Available qty" value={productForm.available} onChange={(e) => setProductForm({ ...productForm, available: e.target.value })} required />
        </div>
        <select className="admin-select" value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} required>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.category_id}>{category.category_id} · {category.name}</option>
          ))}
        </select>
        <input className="admin-input" placeholder="Image filename or URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />

        <div className="flex gap-2">
          <button type="submit" className="admin-btn admin-btn-primary flex-1" disabled={saving}>
            {saving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
          </button>
          {editingProductId && (
            <button
              type="button"
              className="admin-btn admin-btn-soft"
              onClick={() => {
                setEditingProductId(null);
                setProductForm(emptyProductForm);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>

    <div className="admin-card rounded-3xl p-5 overflow-x-auto">
      <SectionHeader title="Products" subtitle="All rental items in the system." search={search} setSearch={setSearch} />
      <table className="admin-table min-w-[850px]">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="font-bold">{product.name}</div>
                <div className="text-xs text-[#3a6bb5]/70">ID: {product.product_id}</div>
              </td>
              <td>{product.category_id}</td>
              <td className="font-bold">{money(product.pricePerDay)}</td>
              <td>
                <span className={Number(product.available || 0) <= 2 ? "admin-status admin-status-cancelled" : "admin-status admin-status-confirmed"}>
                  {product.available || 0} available
                </span>
              </td>
              <td className="text-xs max-w-[180px] truncate">{product.image || "-"}</td>
              <td>
                <div className="flex gap-2">
                  <button type="button" className="admin-btn admin-btn-soft !py-2" onClick={() => editProduct(product)}>Edit</button>
                  <button type="button" className="admin-btn admin-btn-danger !py-2" onClick={() => deleteProduct(product._id)}>Delete</button>
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

const CategoriesView = ({
  categories,
  search,
  setSearch,
  categoryForm,
  setCategoryForm,
  editingCategoryId,
  setEditingCategoryId,
  handleCategorySubmit,
  editCategory,
  deleteCategory,
  saving,
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5">
    <div className="admin-card rounded-3xl p-5 h-fit">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">
        {editingCategoryId ? "Edit Category" : "Add Category"}
      </h3>
      <p className="text-sm text-[#3a6bb5]/70 mb-5">Manage equipment categories.</p>

      <form onSubmit={handleCategorySubmit} className="space-y-3">
        <input className="admin-input" type="number" placeholder="Category ID" value={categoryForm.category_id} onChange={(e) => setCategoryForm({ ...categoryForm, category_id: e.target.value })} required />
        <input className="admin-input" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
        <textarea className="admin-textarea" placeholder="Description" rows="3" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
        <div className="flex gap-2">
          <button type="submit" className="admin-btn admin-btn-primary flex-1" disabled={saving}>{saving ? "Saving..." : editingCategoryId ? "Update" : "Add"}</button>
          {editingCategoryId && (
            <button
              type="button"
              className="admin-btn admin-btn-soft"
              onClick={() => {
                setEditingCategoryId(null);
                setCategoryForm(emptyCategoryForm);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>

    <div className="admin-card rounded-3xl p-5 overflow-x-auto">
      <SectionHeader title="Categories" subtitle="Create, edit and remove categories." search={search} setSearch={setSearch} />
      <table className="admin-table min-w-[700px]">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td className="font-bold text-[#0f3466]">{category.category_id}</td>
              <td className="font-bold">{category.name}</td>
              <td>{category.description || "-"}</td>
              <td>
                <div className="flex gap-2">
                  <button type="button" className="admin-btn admin-btn-soft !py-2" onClick={() => editCategory(category)}>Edit</button>
                  <button type="button" className="admin-btn admin-btn-danger !py-2" onClick={() => deleteCategory(category._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!categories.length && <EmptyBlock text="No categories found" />}
    </div>
  </div>
);

const CustomersView = ({ users, search, setSearch, updateUserRole }) => (
  <div className="admin-card rounded-3xl p-5 overflow-x-auto">
    <SectionHeader title="Customers" subtitle="View all users and change admin access." search={search} setSearch={setSearch} />
    <table className="admin-table min-w-[850px]">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Contact</th>
          <th>NIC</th>
          <th>Active</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td className="font-bold">{user.fullName}</td>
            <td>{user.email}</td>
            <td>{user.contactNumber}</td>
            <td>{user.nic}</td>
            <td>
              <span className={user.isActive ? "admin-status admin-status-confirmed" : "admin-status admin-status-cancelled"}>
                {user.isActive ? "Yes" : "No"}
              </span>
            </td>
            <td>
              <select className="admin-select !py-2" value={user.role || "user"} onChange={(e) => updateUserRole(user._id, e.target.value)}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {!users.length && <EmptyBlock text="No users found" />}
  </div>
);

const PaymentsView = ({ bookings, search, setSearch, updateBookingStatus }) => (
  <div className="admin-card rounded-3xl p-5 overflow-x-auto">
    <SectionHeader title="Payments" subtitle="Manage payment status for every booking." search={search} setSearch={setSearch} />
    <table className="admin-table min-w-[850px]">
      <thead>
        <tr>
          <th>Reference</th>
          <th>Customer</th>
          <th>Method</th>
          <th>Total</th>
          <th>Advance</th>
          <th>Transaction</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking._id}>
            <td className="font-bold text-[#0f3466]">{booking.bookingReference || booking._id?.slice(-6)}</td>
            <td>{booking.customerName}</td>
            <td>{booking.paymentMethod}</td>
            <td className="font-bold">{money(booking.totalAmount)}</td>
            <td>{money(booking.advancePaid)}</td>
            <td className="text-xs max-w-[150px] truncate">{booking.transactionId || "-"}</td>
            <td>
              <select className="admin-select !py-2" value={booking.paymentStatus || "Pending"} onChange={(e) => updateBookingStatus(booking._id, "paymentStatus", e.target.value)}>
                <option>Pending</option>
                <option>Paid</option>
                <option>Failed</option>
                <option>Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {!bookings.length && <EmptyBlock text="No payments found" />}
  </div>
);

const IncomeView = ({ overview, bookings }) => {
  const paymentMethodTotals = bookings.reduce((acc, booking) => {
    const method = booking.paymentMethod || "Unknown";
    if ((booking.bookingStatus || "").toLowerCase() === "cancelled") return acc;
    acc[method] = (acc[method] || 0) + Number(booking.totalAmount || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard stat={{ icon: "💰", label: "Monthly Income", value: money(overview?.stats?.monthlyIncome), tone: "this month" }} />
        <StatCard stat={{ icon: "📅", label: "Today Income", value: money(overview?.stats?.todayIncome), tone: "today" }} />
        <StatCard stat={{ icon: "📈", label: "Annual Revenue", value: money(overview?.stats?.annualRevenue), tone: "this year" }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Revenue Growth" icon="📈">
          <BarChart data={overview?.monthlyRevenue || []} formatter={money} />
        </ChartCard>
        <div className="admin-card rounded-3xl p-5">
          <h3 className="font-extrabold text-[#0a254a] mb-4">Payment Method Breakdown</h3>
          {Object.entries(paymentMethodTotals).map(([method, total]) => (
            <div key={method} className="flex justify-between border-b border-white/50 py-3">
              <span>{method}</span>
              <strong>{money(total)}</strong>
            </div>
          ))}
          {!Object.keys(paymentMethodTotals).length && <EmptyBlock text="No income data yet" />}
        </div>
      </div>
    </div>
  );
};

const ReportsView = ({ overview, products, bookings }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <div className="admin-card rounded-3xl p-5">
      <h3 className="font-extrabold text-[#0a254a] mb-4">Booking Status Report</h3>
      <StatusDonut counts={overview?.statusCounts || {}} />
    </div>
    <div className="admin-card rounded-3xl p-5">
      <h3 className="font-extrabold text-[#0a254a] mb-4">Low Stock Products</h3>
      {(overview?.lowStockProducts || []).map((product) => (
        <div key={product._id} className="flex justify-between border-b border-white/50 py-3">
          <span className="font-semibold">{product.name}</span>
          <span className="admin-status admin-status-cancelled">{product.available} left</span>
        </div>
      ))}
      {!(overview?.lowStockProducts || []).length && <EmptyBlock text="No low stock products" />}
    </div>
    <div className="admin-card rounded-3xl p-5 lg:col-span-2">
      <h3 className="font-extrabold text-[#0a254a] mb-4">System Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniSummary label="Products" value={products.length} />
        <MiniSummary label="Bookings" value={bookings.length} />
        <MiniSummary label="Stock" value={overview?.stats?.equipmentAvailable || 0} />
        <MiniSummary label="Low Stock" value={overview?.stats?.lowStock || 0} />
      </div>
    </div>
  </div>
);

const NotificationsView = ({ overview }) => {
  const notifications = overview?.notifications || [];

  return (
    <div className="admin-card rounded-3xl p-5">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">Notifications</h3>
      <p className="text-sm text-[#3a6bb5]/70 mb-5">Pending bookings and stock alerts appear here.</p>
      {notifications.map((item, index) => (
        <div key={`${item.type}-${index}`} className="flex gap-3 border-b border-white/50 py-4">
          <span className="w-10 h-10 rounded-2xl bg-[#3a6bb5]/10 flex items-center justify-center text-[#0f3466]">
            {item.type === "stock" ? "⚠" : "▣"}
          </span>
          <div>
            <h4 className="font-bold text-[#0a254a]">{item.title}</h4>
            <p className="text-sm text-[#3a6bb5]/75">{item.message}</p>
          </div>
          <span className="ml-auto text-xs text-[#3a6bb5]/55">{shortDate(item.createdAt)}</span>
        </div>
      ))}
      {!notifications.length && <EmptyBlock text="No notifications" />}
    </div>
  );
};

const OnSiteBookingView = ({ products, form, setForm, selectedProduct, days, total, handleSubmit, saving }) => (
  <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
    <div className="admin-card rounded-3xl p-5">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">Create On Site Booking</h3>
      <p className="text-sm text-[#3a6bb5]/70 mb-5">For walk-in customers who rent directly from your shop.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <select className="admin-select" value={form.productMongoId} onChange={(e) => setForm({ ...form, productMongoId: e.target.value })} required>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>{product.name} · {money(product.pricePerDay)} · {product.available} available</option>
            ))}
          </select>
        </div>
        <input className="admin-input" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
        <input className="admin-input" type="email" placeholder="Customer email" value={form.gmail} onChange={(e) => setForm({ ...form, gmail: e.target.value })} required />
        <input className="admin-input" placeholder="Contact number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
        <input className="admin-input" placeholder="NIC" value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} required />
        <input className="admin-input" placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
        <input className="admin-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input className="admin-input md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input className="admin-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input className="admin-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        <input className="admin-input" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        <select className="admin-select" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
          <option>Paid</option>
          <option>Pending</option>
        </select>
        <div className="md:col-span-2">
          <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={saving}>
            {saving ? "Creating..." : "Create On Site Booking"}
          </button>
        </div>
      </form>
    </div>

    <div className="admin-card rounded-3xl p-5 h-fit">
      <h3 className="font-extrabold text-[#0a254a] mb-4">Booking Summary</h3>
      <SummaryLine label="Product" value={selectedProduct?.name || "Not selected"} />
      <SummaryLine label="Price per day" value={selectedProduct ? money(selectedProduct.pricePerDay) : "-"} />
      <SummaryLine label="Days" value={days} />
      <SummaryLine label="Quantity" value={form.quantity || 1} />
      <div className="mt-4 pt-4 border-t border-white/60 flex justify-between items-center">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-extrabold text-[#0f3466]">{money(total)}</span>
      </div>
    </div>
  </div>
);

const SettingsView = ({ apiUrl, refresh, logout }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <div className="admin-card rounded-3xl p-5">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">Settings</h3>
      <p className="text-sm text-[#3a6bb5]/70 mb-5">Quick admin actions.</p>
      <SummaryLine label="Backend API" value={apiUrl} />
      <SummaryLine label="Admin route" value="/api/admin" />
      <SummaryLine label="Dashboard route" value="/dashboard" />
      <div className="flex gap-2 mt-5">
        <button type="button" className="admin-btn admin-btn-primary" onClick={refresh}>Refresh Data</button>
        <button type="button" className="admin-btn admin-btn-danger" onClick={logout}>Logout</button>
      </div>
    </div>
    <div className="admin-card rounded-3xl p-5">
      <h3 className="text-xl font-extrabold text-[#0a254a] mb-1">Useful Notes</h3>
      <p className="text-sm text-[#3a6bb5]/75 leading-6">
        This dashboard uses your existing user login. When the logged in user role is admin, the normal login redirects to /dashboard. The admin backend checks the logged user id through the x-user-id header.
      </p>
    </div>
  </div>
);

const ProfileView = ({ admin, logout }) => (
  <div className="admin-card rounded-3xl p-6 max-w-3xl">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#3a6bb5] to-[#0f3466] flex items-center justify-center text-white font-extrabold text-xl">
        {initials(admin.fullName)}
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-[#0a254a]">{admin.fullName}</h3>
        <p className="text-[#3a6bb5]/75">{admin.email}</p>
      </div>
    </div>
    <SummaryLine label="Role" value={admin.role} />
    <SummaryLine label="Contact" value={admin.contactNumber || "-"} />
    <SummaryLine label="NIC" value={admin.nic || "-"} />
    <button type="button" className="admin-btn admin-btn-danger mt-5" onClick={logout}>Logout</button>
  </div>
);

const SimpleListView = ({ title, items, empty }) => (
  <div className="admin-card rounded-3xl p-5">
    <h3 className="text-xl font-extrabold text-[#0a254a] mb-4">{title}</h3>
    {items?.length ? (
      items.map((item, index) => (
        <div key={index} className="border-b border-white/50 py-3">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
        </div>
      ))
    ) : (
      <EmptyBlock text={empty} />
    )}
  </div>
);

const LatestUsers = ({ users }) => (
  <div className="admin-card rounded-3xl p-5">
    <h4 className="font-extrabold text-[#0a254a] text-sm mb-3">👤 Latest Users</h4>
    {users.map((user) => (
      <div key={user._id} className="flex items-center gap-3 py-3 border-b border-white/40 last:border-0">
        <div className="w-10 h-10 rounded-2xl bg-[#3a6bb5]/15 flex items-center justify-center text-[#0f3466] font-extrabold">
          {initials(user.fullName)}
        </div>
        <div>
          <p className="text-sm font-bold">{user.fullName}</p>
          <p className="text-xs text-[#3a6bb5]/70">{user.email}</p>
        </div>
        <span className={`ml-auto ${user.isActive ? "admin-status admin-status-confirmed" : "admin-status admin-status-pending"}`}>
          {user.isActive ? "Active" : "Offline"}
        </span>
      </div>
    ))}
    {!users.length && <EmptyBlock text="No users yet" />}
  </div>
);

const TopRented = ({ items }) => (
  <div className="admin-card rounded-3xl p-5">
    <h4 className="font-extrabold text-[#0a254a] text-sm mb-3">🔥 Top Rented Equipment</h4>
    {items.map((item) => (
      <div key={item.name} className="flex justify-between text-sm border-b border-white/40 py-3 last:border-0">
        <span className="font-semibold">{item.name}</span>
        <span className="font-extrabold text-[#0f3466]">{item.quantity} qty · {item.rentals} rentals</span>
      </div>
    ))}
    {!items.length && <EmptyBlock text="No rental data yet" />}
  </div>
);

const SectionHeader = ({ title, subtitle, search, setSearch, buttonText, onButton }) => (
  <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
    <div>
      <h3 className="text-xl font-extrabold text-[#0a254a]">{title}</h3>
      <p className="text-sm text-[#3a6bb5]/70">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="admin-input !rounded-full !py-2 w-52"
      />
      {buttonText && (
        <button type="button" onClick={onButton} className="admin-btn admin-btn-primary">
          {buttonText}
        </button>
      )}
    </div>
  </div>
);

const BookingModal = ({ booking, onClose, updateBookingStatus }) => (
  <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="admin-card rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between gap-4 mb-5">
        <div>
          <h3 className="text-2xl font-extrabold text-[#0a254a]">Booking Details</h3>
          <p className="text-sm text-[#3a6bb5]/70">{booking.bookingReference || booking._id}</p>
        </div>
        <button type="button" className="admin-btn admin-btn-soft" onClick={onClose}>Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <SummaryLine label="Customer" value={booking.customerName} />
        <SummaryLine label="Email" value={booking.gmail} />
        <SummaryLine label="Contact" value={booking.contactNumber} />
        <SummaryLine label="NIC" value={booking.nic} />
        <SummaryLine label="Product" value={booking.productName} />
        <SummaryLine label="Quantity" value={booking.quantity} />
        <SummaryLine label="Start Date" value={shortDate(booking.startDate)} />
        <SummaryLine label="End Date" value={shortDate(booking.endDate)} />
        <SummaryLine label="Address" value={`${booking.address}, ${booking.city}, ${booking.province}`} />
        <SummaryLine label="Total" value={money(booking.totalAmount)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[#3a6bb5]/70">Booking Status</label>
          <select className="admin-select mt-1" value={booking.bookingStatus || "Pending"} onChange={(e) => updateBookingStatus(booking._id, "bookingStatus", e.target.value)}>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Returned</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-[#3a6bb5]/70">Payment Status</label>
          <select className="admin-select mt-1" value={booking.paymentStatus || "Pending"} onChange={(e) => updateBookingStatus(booking._id, "paymentStatus", e.target.value)}>
            <option>Pending</option>
            <option>Paid</option>
            <option>Failed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

const SummaryLine = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-white/50 py-3 text-sm">
    <span className="text-[#3a6bb5]/75 font-bold">{label}</span>
    <span className="font-bold text-[#0a254a] text-right break-all">{value || "-"}</span>
  </div>
);

const MiniSummary = ({ label, value }) => (
  <div className="rounded-2xl bg-white/55 p-4">
    <p className="text-xs text-[#3a6bb5]/70 font-bold">{label}</p>
    <p className="text-2xl font-extrabold text-[#0a254a]">{value}</p>
  </div>
);

const EmptyBlock = ({ text }) => (
  <div className="py-12 text-center text-[#3a6bb5]/60 text-sm">{text}</div>
);

export default AdminDashboard;
