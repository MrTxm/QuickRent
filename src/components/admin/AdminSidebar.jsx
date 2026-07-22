import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { assets } from "../../assets/assets";
import { NAV_ITEMS } from "./adminConfig";
import { initials } from "./adminHelpers";

const AdminSidebar = ({ admin, activeTab, sidebarOpen, changeTab, logout, onProfileClick }) => (
  <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
    <div className="admin-brand">
      <img src={assets.logo} alt="QuickRent" />
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
      <button type="button" className="admin-sidebar-profile clickable" onClick={onProfileClick}>
        <div>{initials(admin.fullName)}</div>
        <span>
          <strong>{admin.fullName || "Admin"}</strong>
          <small>{admin.email}</small>
        </span>
      </button>
      <button type="button" onClick={logout} className="admin-logout-btn">
        <span><FaSignOutAlt /></span>
        Logout
      </button>
    </div>
  </aside>
);

export default AdminSidebar;
