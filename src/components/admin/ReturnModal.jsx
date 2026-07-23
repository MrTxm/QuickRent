import React, { useMemo, useState } from "react";
import { isGroupOverdue, money } from "./adminHelpers";
import toast from "react-hot-toast";

const SummaryLine = ({ label, value }) => (
  <div className="admin-summary-line">
    <span>{label}</span>
    <strong>{value || "-"}</strong>
  </div>
);

const ReturnModal = ({ group, onClose, onSubmit }) => {
  const isOverdueReturn = isGroupOverdue(group);

  const [rows, setRows] = useState(() =>
    (group.items || []).map((item) => ({
      bookingId: item._id,
      productName: item.productName,
      quantity: Number(item.quantity || 0),
      totalAmount: Number(item.totalAmount || 0),
      goodQty: Number(item.quantity || 0),
      damagedQty: 0,
      damageReason: "",
      damageCost: 0,
    }))
  );

  const [overdueCharge, setOverdueCharge] = useState(Number(group.overdueCharge || 0));
  const [overdueReason, setOverdueReason] = useState(group.overdueReason || "");

  const updateRow = (bookingId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.bookingId !== bookingId) return row;

        const next = { ...row, [field]: value };

        if (field === "goodQty") {
          const good = Math.min(Math.max(Number(value || 0), 0), row.quantity);
          next.goodQty = good;
          next.damagedQty = Math.max(row.quantity - good, 0);
        }

        if (field === "damagedQty") {
          const damaged = Math.min(Math.max(Number(value || 0), 0), row.quantity);
          next.damagedQty = damaged;
          next.goodQty = Math.max(row.quantity - damaged, 0);
        }

        return next;
      })
    );
  };

  const totalDamageCost = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.damageCost || 0), 0),
    [rows]
  );

  const totalOverdueCharge = isOverdueReturn ? Number(overdueCharge || 0) : 0;
  const totalExtraCharge = totalDamageCost + totalOverdueCharge;

  const submit = (e) => {
    e.preventDefault();

    for (const row of rows) {
      if (Number(row.goodQty || 0) + Number(row.damagedQty || 0) !== Number(row.quantity || 0)) {
        toast.error(`Good + damaged quantity must equal rented quantity for ${row.productName}`);
        return;
      }

      if (Number(row.damagedQty || 0) > 0 && !String(row.damageReason || "").trim()) {
        toast.error(`Add damage reason for ${row.productName}`);
        return;
      }
    }

    if (totalOverdueCharge < 0) {
      toast.error("Overdue charge cannot be negative");
      return;
    }

    if (totalOverdueCharge > 0 && !String(overdueReason || "").trim()) {
      toast.error("Add a reason/note for the overdue charge");
      return;
    }

    if (!window.confirm("Confirm return and update stock, damage charge, overdue charge, and revenue now?")) return;

    onSubmit(group, rows, {
      overdueCharge: totalOverdueCharge,
      overdueReason: String(overdueReason || "").trim(),
    });
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal-card wide-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="admin-card-head">
          <div>
            <h3>Return Confirmation</h3>
            <p>{group.customerName} · {group.gmail}</p>
          </div>
          <button type="button" className="admin-btn admin-btn-light" onClick={onClose}>Close</button>
        </div>

        <div className="admin-return-summary">
          <SummaryLine label="Customer" value={group.customerName} />
          <SummaryLine label="Email" value={group.gmail} />
          <SummaryLine label="Reference" value={group.bookingReference || group.groupKey} />
          <SummaryLine label="Total amount" value={money(group.totalAmount)} />
          {isOverdueReturn && <SummaryLine label="Booking status" value="Overdue" />}
        </div>

        <div className="admin-return-help">
          Enter how many items came back in good condition and how many are damaged. Good items go back to available stock. Damaged items go to damaged stock. Damage cost and overdue charge are added to revenue.
        </div>

        {isOverdueReturn && (
          <div className="admin-return-row" style={{ marginBottom: "14px" }}>
            <div>
              <strong>Overdue Charge</strong>
              <small>This booking is overdue. Add the manual overdue charge before confirming the return.</small>
            </div>
            <label>
              Charge
              <input
                className="admin-input"
                type="text"
                inputMode="numeric"
                placeholder="Enter overdue charge"
                value={overdueCharge}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  setOverdueCharge(onlyNumbers);
                }}
              />
            </label>
            <label className="reason">
              Reason
              <input
                className="admin-input"
                placeholder="Example: Late return charge"
                value={overdueReason}
                onChange={(e) => setOverdueReason(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="admin-return-list">
          {rows.map((row) => (
            <div key={row.bookingId} className="admin-return-row">
              <div>
                <strong>{row.productName}</strong>
                <small>Booked quantity: {row.quantity}</small>
                <small>Amount: {money(row.totalAmount)}</small>
              </div>

              <label>
                Good
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max={row.quantity}
                  value={row.goodQty}
                  onChange={(e) => updateRow(row.bookingId, "goodQty", e.target.value)}
                />
              </label>

              <label>
                Damaged
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max={row.quantity}
                  value={row.damagedQty}
                  onChange={(e) => updateRow(row.bookingId, "damagedQty", e.target.value)}
                />
              </label>

              <label>
                Damage cost
                <input
                  className="admin-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter damage cost"
                  value={row.damageCost}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                    updateRow(row.bookingId, "damageCost", onlyNumbers);
                  }}
                />
              </label>

              <label className="reason">
                Reason
                <input
                  className="admin-input"
                  placeholder="Reason if damaged"
                  value={row.damageReason}
                  onChange={(e) => updateRow(row.bookingId, "damageReason", e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="admin-total-line">
          <span>Total damage cost</span>
          <strong>{money(totalDamageCost)}</strong>
        </div>

        {isOverdueReturn && (
          <div className="admin-total-line">
            <span>Total overdue charge</span>
            <strong>{money(totalOverdueCharge)}</strong>
          </div>
        )}

        <div className="admin-total-line">
          <span>Total extra revenue</span>
          <strong>{money(totalExtraCharge)}</strong>
        </div>

        <button type="submit" className="admin-btn admin-btn-dark w-full">Confirm Return</button>
      </form>
    </div>
  );
};

export default ReturnModal;
