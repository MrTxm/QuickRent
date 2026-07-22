import React from "react";
import { FaBoxes, FaCalendarCheck, FaExclamationTriangle, FaMoneyBillWave } from "react-icons/fa";
import { money, printMonthlyHistory } from "./adminHelpers";
import { MonthSelect } from "./SharedUI";
import BookingGroupsTable from "./BookingGroupsTable";

const ReportsView = ({ overview, bookingGroups, products, selectedMonth, setSelectedMonth, selectedMonthLabel, selectedMonthOrders }) => (
  <div className="admin-dashboard-space">
    <div className="admin-stat-grid clean">
      <div className="admin-stat-card static"><div className="admin-stat-icon"><FaMoneyBillWave /></div><div><span>Total Revenue</span><strong>{money(overview?.stats?.totalRevenue)}</strong><small>Collected</small></div></div>
      <div className="admin-stat-card static"><div className="admin-stat-icon"><FaMoneyBillWave /></div><div><span>Pending Payment</span><strong>{money(overview?.stats?.pendingPayment)}</strong><small>Balance</small></div></div>
      <div className="admin-stat-card static"><div className="admin-stat-icon"><FaExclamationTriangle /></div><div><span>Damaged Stock</span><strong>{overview?.stats?.damagedStock || 0}</strong><small>Need check</small></div></div>
      <div className="admin-stat-card static"><div className="admin-stat-icon"><FaCalendarCheck /></div><div><span>Orders</span><strong>{bookingGroups.length}</strong><small>Grouped</small></div></div>
    </div>

    <div className="admin-card admin-section-card">
      <div className="admin-card-head">
        <div><h3>Monthly Order Printout</h3><p>Select a month and print the booking history.</p></div>
        <div className="admin-head-actions">
          <MonthSelect months={overview?.revenueMonths || []} value={selectedMonth} onChange={setSelectedMonth} />
          <button type="button" className="admin-btn admin-btn-dark" onClick={() => printMonthlyHistory(selectedMonthLabel, selectedMonthOrders)}>Print Monthly</button>
        </div>
      </div>
      <BookingGroupsTable bookings={selectedMonthOrders} setSelectedBooking={() => {}} markBalancePaid={() => {}} setReturnBooking={() => {}} compact />
    </div>

    <div className="admin-card admin-section-card">
      <div className="admin-card-head"><div><h3>Damaged Stock Summary</h3><p>Products moved to damaged stock after return confirmation.</p></div></div>
      <div className="admin-chip-list">
        {products.filter((product) => Number(product.damaged || 0) > 0).map((product) => (
          <span key={product._id} className="admin-category-chip damaged"><FaBoxes /> {product.name}: {product.damaged}</span>
        ))}
      </div>
      {!products.some((product) => Number(product.damaged || 0) > 0) && <div className="admin-empty-block">No damaged stock</div>}
    </div>
  </div>
);

export default ReportsView;
