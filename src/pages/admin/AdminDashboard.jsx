import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./AdminDashboard.css";

import { emptyCategoryForm, emptyOnSiteForm, emptyProductForm } from "../../components/admin/adminConfig";
import {
  API_URL,
  buildNotifications,
  calculateDays,
  getMonthKey,
  isGroupCancelled,
  isGroupExpired,
  isGroupHandoverActive,
  isGroupReturned,
  isGroupOverdue,
  isGroupConfirmed,
  money,
  readAdmin,
} from "../../components/admin/adminHelpers";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopBar from "../../components/admin/AdminTopBar";
import DashboardView from "../../components/admin/DashboardView";
import BookingsView from "../../components/admin/BookingsView";
import InventoryView from "../../components/admin/InventoryView";
import AddProductView from "../../components/admin/AddProductView";
import AddCategoryView from "../../components/admin/AddCategoryView";
import CustomersView from "../../components/admin/CustomersView";
import OnSiteBookingView from "../../components/admin/OnSiteBookingView";
import ReportsView from "../../components/admin/ReportsView";
import DamageStockView from "../../components/admin/DamageStockView";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import ReturnModal from "../../components/admin/ReturnModal";
import AdminProfileModal from "../../components/admin/AdminProfileModal";
import { LoadingState } from "../../components/admin/SharedUI";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(readAdmin);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("quickrent_admin_dark") === "true");
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

  const previousCountsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("quickrent_admin_dark", String(darkMode));
  }, [darkMode]);

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

  const sortedBookingGroups = useMemo(() => {
    return [...bookingGroups].sort((a, b) => {
      const startA = new Date(a.startDate || a.createdAt || 0).getTime();
      const startB = new Date(b.startDate || b.createdAt || 0).getTime();
      if (startA !== startB) return startA - startB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [bookingGroups]);

  const loadAll = async (showLoader = true) => {
    if (!admin) return;

    if (showLoader) setLoading(true);
    setError("");

    try {
      const [overviewRes, bookingsRes, productsRes, usersRes, categoriesRes] = await Promise.all([
        api.get("/api/admin/overview"),
        api.get("/api/admin/bookings/grouped"),
        api.get("/api/admin/products"),
        api.get("/api/admin/users"),
        api.get("/api/admin/categories"),
      ]);

      const overviewData = overviewRes.data;
      const bookingsData = bookingsRes.data || [];
      const productsData = productsRes.data || [];
      const usersData = usersRes.data || [];
      const categoriesData = categoriesRes.data || [];

      setOverview(overviewData);
      setBookingGroups(bookingsData);
      setProducts(productsData);
      setUsers(usersData);
      setCategories(categoriesData);

      if (overviewData?.revenueMonths?.length) {
        const exists = overviewData.revenueMonths.some((month) => month.key === selectedMonth);
        if (!exists) setSelectedMonth(overviewData.revenueMonths[0].key);
      }

      const currentCounts = {
        bookings: overviewData?.stats?.totalBookingGroups || bookingsData.length,
        pending: overviewData?.stats?.pendingBookings || 0,
        activeUsers: usersData.filter((user) => user.isActive).length,
      };

      if (previousCountsRef.current) {
        if (currentCounts.bookings > previousCountsRef.current.bookings) {
          toast.success("New booking received in the admin dashboard");
        }
        if (currentCounts.activeUsers > previousCountsRef.current.activeUsers) {
          toast.success("A user is now active");
        }
        if (currentCounts.pending > previousCountsRef.current.pending) {
          toast("There are new pending booking alerts");
        }
      }

      previousCountsRef.current = currentCounts;
    } catch (err) {
      console.log("ADMIN LOAD ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Admin dashboard failed to load");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      navigate("/");
      return;
    }

    loadAll();
    const timer = setInterval(() => loadAll(false), 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, navigate]);

  const filteredBookingGroups = useMemo(() => {
    const term = search.toLowerCase().trim();
    const base = sortedBookingGroups;
    if (!term) return base;

    return base.filter((group) =>
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
  }, [sortedBookingGroups, search]);

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
      [user.fullName, user.email, user.contactNumber, user.nic, user.role, user.isActive ? "active" : "non-active"]
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
    () => sortedBookingGroups.filter((group) => getMonthKey(group.createdAt || group.startDate) === selectedMonth),
    [sortedBookingGroups, selectedMonth]
  );

  const selectedMonthLabel = useMemo(() => {
    const match = overview?.revenueMonths?.find((month) => month.key === selectedMonth);
    return match?.label || selectedMonth;
  }, [overview, selectedMonth]);

  const selectedMonthChart = overview?.revenueDaily?.[selectedMonth] || [];

  const notifications = useMemo(
    () => buildNotifications(overview, sortedBookingGroups, products, users),
    [overview, sortedBookingGroups, products, users]
  );

  const refreshAfterAction = async () => {
    await loadAll();
  };

  const updateGroupStatus = async (groupKey, bookingStatus) => {
    try {
      await toast.promise(
        api.put(`/api/admin/bookings/groups/${encodeURIComponent(groupKey)}/status`, { bookingStatus }),
        {
          loading: "Updating booking status...",
          success: "Booking status updated",
          error: "Booking status update failed",
        }
      );
      await refreshAfterAction();
    } catch (err) {
      console.log("GROUP STATUS ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Booking status update failed");
    }
  };

  const markBalancePaid = async (group) => {
  if (isGroupCancelled(group) || isGroupReturned(group) || isGroupExpired(group)) {
    toast.error("This booking is already closed.");
    return;
  }

  const canCollectPayment =
    isGroupHandoverActive(group) || isGroupConfirmed(group) || isGroupOverdue(group);

  if (!canCollectPayment) {
    toast.error("Confirm product handover first. Then collect the balance payment.");
    return;
  }

  const totalAmount = Number(group.totalAmount || 0);
  const advancePaid = Number(group.advancePaid || 0);
  const balance = Number(group.balanceAmount || totalAmount - advancePaid || 0);

  const message =
    balance > 0
      ? `Mark balance ${money(balance)} as paid for ${group.bookingReference || group.groupKey}?`
      : `Mark this booking as fully paid?`;

  if (!window.confirm(message)) return;

  try {
    const res = await toast.promise(
      api.put(`/api/admin/bookings/groups/${encodeURIComponent(group.groupKey)}/settle`, {
        paymentStatus: "Paid",
      }),
      {
        loading: "Marking payment as paid...",
        success: "Payment marked as paid",
        error: "Payment update failed",
      }
    );

    await refreshAfterAction();

    const paidGroup = res.data?.group || {
      ...group,
      paymentLabel: "Paid",
      paymentStatus: "Paid",
      settlementStatus: "paid",
      balanceAmount: 0,
      balancePaid: true,
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
    toast.error(err.response?.data?.message || "Payment update failed");
  }
};

  const handleReturnSubmit = async (group, returnItems, extraCharges = {}) => {
  try {
    await api.post(`/api/admin/bookings/groups/${encodeURIComponent(group.groupKey)}/return`, {
      items: returnItems,
      overdueCharge: Number(extraCharges.overdueCharge || 0),
      overdueReason: extraCharges.overdueReason || "",
    });

    setReturnBooking(null);
    await refreshAfterAction();
    alert("Return completed successfully");
  } catch (err) {
    console.log("RETURN ERROR:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Return process failed");
  }
};

  const buildProductFormData = () => {
    const formData = new FormData();
    formData.append("product_id", productForm.product_id);
    formData.append("name", productForm.name);
    formData.append("description", productForm.description);
    formData.append("pricePerDay", Number(productForm.pricePerDay));
    formData.append("category_id", Number(productForm.category_id));
    formData.append("available", Number(productForm.available));
    formData.append("damaged", Number(productForm.damaged || 0));
    formData.append("image", productForm.image || "");
    if (productForm.imageFile) formData.append("imageFile", productForm.imageFile);
    return formData;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = buildProductFormData();
      if (editingProductId) {
        await toast.promise(
          axios.put(`${API_URL}/api/admin/products/${editingProductId}`, formData, { headers }),
          { loading: "Updating product...", success: "Product updated", error: "Product update failed" }
        );
      } else {
        await toast.promise(
          axios.post(`${API_URL}/api/admin/products`, formData, { headers }),
          { loading: "Adding product...", success: "Product added", error: "Product save failed" }
        );
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadAll();
      setActiveTab("inventory");
    } catch (err) {
      console.log("PRODUCT SAVE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Product save failed");
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
      imageFile: null,
      imagePreview: "",
      available: product.available || "",
      damaged: product.damaged || "",
    });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await toast.promise(api.delete(`/api/admin/products/${productId}`), {
        loading: "Deleting product...",
        success: "Product deleted",
        error: "Product delete failed",
      });
      await loadAll();
    } catch (err) {
      console.log("PRODUCT DELETE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Product delete failed");
    }
  };

  const buildCategoryFormData = () => {
    const formData = new FormData();
    formData.append("category_id", Number(categoryForm.category_id));
    formData.append("name", categoryForm.name);
    formData.append("description", categoryForm.description || "");
    formData.append("image", categoryForm.image || "");
    if (categoryForm.imageFile) formData.append("imageFile", categoryForm.imageFile);
    return formData;
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = buildCategoryFormData();
      if (editingCategoryId) {
        await toast.promise(
          axios.put(`${API_URL}/api/admin/categories/${editingCategoryId}`, formData, { headers }),
          { loading: "Updating category...", success: "Category updated", error: "Category update failed" }
        );
      } else {
        await toast.promise(
          axios.post(`${API_URL}/api/admin/categories`, formData, { headers }),
          { loading: "Adding category...", success: "Category added", error: "Category save failed" }
        );
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadAll();
    } catch (err) {
      console.log("CATEGORY SAVE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Category save failed");
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
      image: category.image || "",
      imageFile: null,
      imagePreview: "",
    });
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await toast.promise(api.delete(`/api/admin/categories/${categoryId}`), {
        loading: "Deleting category...",
        success: "Category deleted",
        error: "Category delete failed",
      });
      await loadAll();
    } catch (err) {
      console.log("CATEGORY DELETE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Category delete failed");
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await toast.promise(api.put(`/api/admin/users/${userId}/role`, { role }), {
        loading: "Updating user role...",
        success: "User role updated",
        error: "Role update failed",
      });
      await loadAll();
    } catch (err) {
      console.log("USER ROLE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Role update failed");
    }
  };

  const updateUserActive = async (userId, isActive) => {
    try {
      await toast.promise(api.put(`/api/admin/users/${userId}/active`, { isActive }), {
        loading: "Updating user status...",
        success: isActive ? "User marked active" : "User marked non-active",
        error: "User status update failed",
      });
      await loadAll();
    } catch (err) {
      console.log("USER ACTIVE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "User status update failed");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user account?")) return;

    try {
      await toast.promise(api.delete(`/api/admin/users/${userId}`), {
        loading: "Deleting user...",
        success: "User deleted",
        error: "User delete failed",
      });
      await loadAll();
    } catch (err) {
      console.log("USER DELETE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "User delete failed");
    }
  };

  const handleOnSiteSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOnSiteProduct) {
      toast.error("Please select a product");
      return;
    }

    setSaving(true);

    try {
      await toast.promise(
        api.post("/api/admin/bookings/on-site", {
          ...onSiteForm,
          days: onSiteDays,
          totalAmount: onSiteTotal,
        }),
        {
          loading: "Creating on site booking...",
          success: "On site booking created",
          error: "On site booking failed",
        }
      );

      setOnSiteForm(emptyOnSiteForm);
      await loadAll();
      setActiveTab("bookings");
    } catch (err) {
      console.log("ON SITE BOOKING ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "On site booking failed");
    } finally {
      setSaving(false);
    }
  };

  const updateAdminProfile = async (form) => {
    setSaving(true);
    try {
      const res = await toast.promise(api.put("/api/admin/profile", form), {
        loading: "Saving admin profile...",
        success: "Admin profile updated",
        error: "Profile update failed",
      });

      const updatedAdmin = res.data;
      setAdmin(updatedAdmin);
      localStorage.setItem("user", JSON.stringify(updatedAdmin));
      localStorage.setItem("quickrent_admin", JSON.stringify(updatedAdmin));
      setProfileOpen(false);
    } catch (err) {
      console.log("ADMIN PROFILE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Profile update failed");
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
    setNotificationOpen(false);
  };

  const handleNotificationNavigate = (tabId) => {
    changeTab(tabId);
  };

  if (!admin) return null;

  return (
    <div className={`admin-shell ${darkMode ? "admin-dark-mode" : ""}`}>
      {/* <Toaster position="top-right" /> */}

      <AdminSidebar
        admin={admin}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        changeTab={changeTab}
        logout={logout}
        onProfileClick={() => setProfileOpen(true)}
      />

      {sidebarOpen && (
        <button type="button" className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
      )}

      <main className="admin-main">
        <AdminTopBar
          admin={admin}
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          refresh={loadAll}
          notifications={notifications}
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          onNotificationNavigate={handleNotificationNavigate}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
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
                search={search}
                setSearch={setSearch}
                editProduct={editProduct}
                deleteProduct={deleteProduct}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "addProduct" && (
              <AddProductView
                categories={categories}
                productForm={productForm}
                setProductForm={setProductForm}
                editingProductId={editingProductId}
                setEditingProductId={setEditingProductId}
                handleProductSubmit={handleProductSubmit}
                saving={saving}
              />
            )}

            {activeTab === "addCategory" && (
              <AddCategoryView
                categories={categories}
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
                updateUserActive={updateUserActive}
                deleteUser={deleteUser}
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

            {activeTab === "damageStock" && <DamageStockView bookingGroups={bookingGroups} />}

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

      {profileOpen && (
        <AdminProfileModal
          admin={admin}
          onClose={() => setProfileOpen(false)}
          onSubmit={updateAdminProfile}
          saving={saving}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
