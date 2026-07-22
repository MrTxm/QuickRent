export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const readAdmin = () => {
  const saved = localStorage.getItem("quickrent_admin") || localStorage.getItem("user");
  if (!saved) return null;

  try {
    const user = JSON.parse(saved);
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
};

export const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

export const shortDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getMonthKey = (value) => {
  const date = value ? new Date(value) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const initials = (name = "Admin") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "AD";

export const statusClass = (status) =>
  `admin-status admin-status-${String(status || "pending").toLowerCase().replace(/\s+/g, "-")}`;

export const normalizeStatus = (value) => String(value || "").toLowerCase().replace(/\s+/g, "-");
export const isGroupPending = (group) => normalizeStatus(group?.bookingStatus) === "pending";
export const isGroupConfirmed = (group) => normalizeStatus(group?.bookingStatus) === "confirmed";
export const isGroupOverdue = (group) => normalizeStatus(group?.bookingStatus) === "overdue";
export const isGroupReturned = (group) => normalizeStatus(group?.bookingStatus) === "returned";
export const isGroupExpired = (group) => normalizeStatus(group?.bookingStatus) === "expired";
export const isGroupCancelled = (group) => ["cancelled", "failed"].includes(normalizeStatus(group?.bookingStatus));
export const isGroupHandoverActive = (group) => isGroupConfirmed(group) || isGroupOverdue(group);
export const isGroupPaid = (group) =>
  group?.settlementStatus === "paid" ||
  normalizeStatus(group?.paymentLabel) === "paid" ||
  normalizeStatus(group?.paymentLabel) === "fully-paid" ||
  Number(group?.balanceAmount || 0) <= 0;

export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(days, 1);
};

export const safeText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const getImageSrc = (image) => {
  if (!image) return "";
  if (String(image).startsWith("http") || String(image).startsWith("data:")) return image;
  return `${API_URL}${image}`;
};

export const openPrintWindow = (title, bodyHtml) => {
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

export const printBookingBill = (group) => {
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

export const printMonthlyHistory = (monthLabel, orders) => {
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

export const buildNotifications = (overview, bookingGroups = [], products = [], users = []) => {
  const notifications = [];
  const stats = overview?.stats || {};

  const add = (type, title, message, actionTab = "dashboard", priority = 1) => {
    notifications.push({ id: `${type}-${notifications.length}`, type, title, message, actionTab, priority });
  };

  if (Number(stats.pendingBookings || 0) > 0) {
    add("booking", "Pending bookings", `${stats.pendingBookings} booking group(s) waiting for handover.`, "bookings", 3);
  }
  if (Number(stats.pendingPayment || 0) > 0) {
    add("payment", "Pending payment", `${money(stats.pendingPayment)} still needs to be collected.`, "bookings", 3);
  }

  const overdue = bookingGroups.filter((group) => normalizeStatus(group.bookingStatus) === "overdue");
  if (overdue.length) add("overdue", "Overdue returns", `${overdue.length} booking group(s) passed the return date.`, "bookings", 4);

  const expired = bookingGroups.filter((group) => normalizeStatus(group.bookingStatus) === "expired");
  if (expired.length) add("expired", "Expired bookings", `${expired.length} pending booking group(s) expired automatically.`, "bookings", 2);

  const lowStock = products.filter((product) => Number(product.available || 0) <= 2);
  if (lowStock.length) add("stock", "Low stock alert", `${lowStock.length} product(s) have low available stock.`, "inventory", 2);

  const damaged = products.filter((product) => Number(product.damaged || 0) > 0);
  if (damaged.length) add("damage", "Damaged stock", `${damaged.length} product type(s) have damaged stock.`, "damageStock", 2);

  const activeUsers = users.filter((user) => user.isActive).length;
  if (activeUsers) add("users", "Active users", `${activeUsers} user(s) are currently marked active.`, "customers", 1);

  return notifications.sort((a, b) => b.priority - a.priority);
};

export const getDamageRows = (bookingGroups = []) => {
  const rows = [];

  bookingGroups.forEach((group) => {
    (group.items || []).forEach((item) => {
      (item.returnItems || []).forEach((returnItem, index) => {
        // Only show products that admin explicitly marked as damaged in ReturnModal.
        // Good returned products and pending return products must not appear here.
        const damagedQty = Number(returnItem.damagedQty || 0);
        if (damagedQty <= 0) return;

        rows.push({
          id: `${item._id}-${index}`,
          productName: returnItem.productName || item.productName,
          productId: returnItem.productId || item.productId,
          productImage: item.productImage,
          damagedQty,
          damageReason: returnItem.damageReason || "Not specified",
          damageCost: Number(returnItem.damageCost || 0),
          customerName: group.customerName,
          gmail: group.gmail,
          bookingReference: group.bookingReference || group.groupKey,
          returnedAt: item.returnedAt || group.returnedAt || group.updatedAt,
        });
      });
    });
  });

  return rows.sort((a, b) => new Date(b.returnedAt || 0) - new Date(a.returnedAt || 0));
};
