import React from "react";
import { FaBell, FaExclamationTriangle, FaMoneyBillWave, FaBoxes, FaUsers, FaCalendarCheck } from "react-icons/fa";

const iconMap = {
  booking: <FaCalendarCheck />,
  payment: <FaMoneyBillWave />,
  overdue: <FaExclamationTriangle />,
  expired: <FaExclamationTriangle />,
  stock: <FaBoxes />,
  damage: <FaExclamationTriangle />,
  users: <FaUsers />,
};

const NotificationPanel = ({ notifications, onNavigate, onClose }) => (
  <div className="admin-notification-panel">
    <div className="admin-notification-head">
      <div>
        <h3>Notifications</h3>
        <p>Important shop updates and alerts.</p>
      </div>
      <button type="button" onClick={onClose}>×</button>
    </div>

    {notifications.length === 0 ? (
      <div className="admin-notification-empty">
        <FaBell />
        <p>No new alerts right now.</p>
      </div>
    ) : (
      <div className="admin-notification-list">
        {notifications.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-notification-item priority-${item.priority}`}
            onClick={() => onNavigate(item.actionTab)}
          >
            <span>{iconMap[item.type] || <FaBell />}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.message}</small>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default NotificationPanel;
