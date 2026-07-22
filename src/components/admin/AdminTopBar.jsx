import React from "react";
import { FaBars, FaBell, FaMoon, FaSun, FaSyncAlt } from "react-icons/fa";
import { NAV_ITEMS } from "./adminConfig";
import NotificationPanel from "./NotificationPanel";

const AdminTopBar = ({ admin, activeTab, setSidebarOpen, refresh, notifications, notificationOpen, setNotificationOpen, onNotificationNavigate, darkMode, setDarkMode }) => {
  const title = NAV_ITEMS.find((item) => item.id === activeTab)?.label || "Dashboard";

  return (
    <div className="admin-topbar">
      <div className="admin-title-row">
        <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </button>
        <div>
          <h1>{title}</h1>
          <p>Welcome back, {admin.fullName || "Admin"}</p>
        </div>
      </div>

      <div className="admin-top-actions">
        <button type="button" onClick={refresh} className="admin-btn admin-btn-light">
          <FaSyncAlt /> Refresh
        </button>
        <button type="button" onClick={() => setDarkMode((prev) => !prev)} className="admin-btn admin-btn-light">
          {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? "Light" : "Dark"}
        </button>
        <div className="admin-date-chip">{new Date().toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        <div className="admin-bell-wrap">
          <button type="button" className="admin-bell" onClick={() => setNotificationOpen((prev) => !prev)}>
            <FaBell size={20}/>
            {notifications.length > 0 && <span>{notifications.length}</span>}
          </button>
          {notificationOpen && (
            <NotificationPanel
              notifications={notifications}
              onNavigate={onNotificationNavigate}
              onClose={() => setNotificationOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;
