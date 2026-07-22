import React from "react";
import { assets } from "../../assets/assets";
import { money, printMonthlyHistory } from "./adminHelpers";
import { BarChart, MonthSelect } from "./SharedUI";
import BookingGroupsTable from "./BookingGroupsTable";

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
              if (card.label === "Available Stock") setActiveTab("inventory");
            }}
          >
            <img className="admin-stat-icon" src={card.icon} alt="" />
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

export default DashboardView;
