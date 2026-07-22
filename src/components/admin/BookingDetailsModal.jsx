import React from "react";
import {
  isGroupExpired,
  isGroupHandoverActive,
  isGroupPaid,
  isGroupPending,
  isGroupReturned,
  money,
  printBookingBill,
  shortDate,
} from "./adminHelpers";
import { SummaryLine } from "./SharedUI";

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
        {isGroupHandoverActive(group) && !isGroupPaid(group) && <button type="button" className="admin-btn admin-btn-dark" onClick={() => markBalancePaid(group)}>Mark Balance Paid</button>}
        {isGroupHandoverActive(group) && isGroupPaid(group) && <button type="button" className="admin-btn admin-btn-blue" onClick={() => { onClose(); setReturnBooking(group); }}>Returned</button>}
        {isGroupReturned(group) && <span className="admin-status admin-status-returned">Return completed</span>}
        {isGroupExpired(group) && <span className="admin-status admin-status-expired">Expired automatically</span>}
        <button type="button" className="admin-btn admin-btn-print" onClick={() => printBookingBill(group)}>Print Bill</button>
      </div>
    </div>
  </div>
);

export default BookingDetailsModal;
