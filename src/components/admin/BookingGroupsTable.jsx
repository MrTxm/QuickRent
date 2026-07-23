import React from "react";
import {
  isGroupCancelled,
  isGroupExpired,
  isGroupHandoverActive,
  isGroupOverdue,
  isGroupPending,
  isGroupConfirmed,
  isGroupReturned,
  money,
  printBookingBill,
  shortDate,
  statusClass,
} from "./adminHelpers";
import { EmptyBlock } from "./SharedUI";

const cleanText = (value = "") => String(value || "").trim().toLowerCase();

const BookingGroupsTable = ({
  bookings,
  setSelectedBooking,
  updateGroupStatus,
  markBalancePaid,
  setReturnBooking,
  compact = false,
}) => {
  if (!bookings.length) return <EmptyBlock text="No bookings found" />;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Date</th>
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
            const pending = isGroupPending(group);
            const confirmed = isGroupConfirmed(group);
            const overdue = isGroupOverdue(group);
            const returned = isGroupReturned(group);
            const expired = isGroupExpired(group);
            const cancelled = isGroupCancelled(group);

            const handoverActive =
              isGroupHandoverActive(group) || confirmed || overdue;

            const paymentText = cleanText(
              group.paymentLabel || group.paymentStatus
            );

            const paymentIsPending =
              paymentText.includes("pending") ||
              paymentText.includes("unpaid") ||
              paymentText.includes("failed");

            const paid =
              !paymentIsPending &&
              (paymentText === "paid" || group.balancePaid === true);

            const totalAmount = Number(group.totalAmount || 0);
            const advancePaid = Number(group.advancePaid || 0);

            const displayBalance = paid
              ? 0
              : Math.max(totalAmount - advancePaid, 0);

            const paymentLabel = paid
              ? "Paid"
              : group.paymentLabel || group.paymentStatus || "Pending";

            return (
              <tr key={group.groupKey}>
                <td>
                  <strong className="admin-ref">
                    {group.bookingReference || group.groupKey}
                  </strong>
                  <small>Created: {shortDate(group.createdAt)}</small>
                </td>

                <td>
                  <strong>{shortDate(group.startDate)}</strong>
                  <small>to {shortDate(group.endDate)}</small>
                </td>

                <td>
                  <strong>{group.customerName}</strong>
                  <small>{group.gmail}</small>
                </td>

                <td>
                  <div className="admin-product-stack">
                    {(group.items || []).map((item) => (
                      <span key={item._id}>
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </td>

                <td>
                  <strong>{money(group.totalAmount)}</strong>
                  <small>Advance: {money(group.advancePaid)}</small>
                  <small>Balance: {money(displayBalance)}</small>

                  <span className={statusClass(paymentLabel)}>
                    {paymentLabel}
                  </span>
                </td>

                <td>
                  <span className={statusClass(group.bookingStatus)}>
                    {group.bookingStatus}
                  </span>

                  <small className="admin-flow-note">
                    {pending && "waiting for handover"}
                    {confirmed && !paid && "collect balance"}
                    {confirmed && paid && "ready to return"}
                    {overdue && !paid && "overdue, collect balance"}
                    {overdue && paid && "overdue, collect return"}
                    {returned && "return completed"}
                    {expired && "expired automatically"}
                    {cancelled && "closed"}
                  </small>
                </td>

                <td>
                  <div
                    className={`admin-action-stack ${
                      compact ? "compact-actions" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="admin-btn admin-btn-light"
                      onClick={() => setSelectedBooking(group)}
                    >
                      View
                    </button>

                    {updateGroupStatus && pending && (
                      <>
                        <button
                          type="button"
                          className="admin-btn admin-btn-green"
                          onClick={() =>
                            updateGroupStatus(group.groupKey, "Confirmed")
                          }
                        >
                          Confirm Handover
                        </button>

                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() =>
                            updateGroupStatus(group.groupKey, "Cancelled")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {handoverActive && !paid && markBalancePaid && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-dark"
                        onClick={() => markBalancePaid(group)}
                      >
                        Mark Balance Paid
                      </button>
                    )}

                    {handoverActive && paid && setReturnBooking && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-blue"
                        onClick={() => setReturnBooking(group)}
                      >
                        Returned
                      </button>
                    )}

                    {returned && (
                      <span className="admin-status admin-status-returned">
                        Closed
                      </span>
                    )}

                    {expired && (
                      <span className="admin-status admin-status-expired">
                        Expired
                      </span>
                    )}

                    {cancelled && (
                      <span className="admin-status admin-status-cancelled">
                        No action
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn-print"
                    onClick={() => printBookingBill(group)}
                  >
                    Print Bill
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingGroupsTable;