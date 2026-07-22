import React from "react";
import { getDamageRows, getImageSrc, money, shortDate } from "./adminHelpers";
import { EmptyBlock } from "./SharedUI";

const DamageStockView = ({ bookingGroups }) => {
  const damageRows = getDamageRows(bookingGroups);

  return (
    <div className="admin-card admin-section-card">
      <div className="admin-card-head">
        <div>
          <h3>Damage Stock</h3>
          <p>Only products marked as damaged during the return check are shown here.</p>
        </div>
      </div>

      {!damageRows.length ? (
        <EmptyBlock text="No damaged return records found" />
      ) : (
        <div className="admin-damage-grid">
          {damageRows.map((row) => (
            <div key={row.id} className="admin-damage-card">
              {row.productImage && <img src={getImageSrc(row.productImage)} alt={row.productName} />}
              <div>
                <strong>{row.productName}</strong>
                <small>Reference: {row.bookingReference}</small>
                <small>Customer: {row.customerName || "-"}</small>
                <small>Email: {row.gmail || "-"}</small>
                <small>Damaged qty: {row.damagedQty}</small>
                <p>{row.damageReason}</p>
                <div className="admin-total-line"><span>Damage cost</span><strong>{money(row.damageCost)}</strong></div>
                {row.returnedAt && <small>Returned: {shortDate(row.returnedAt)}</small>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DamageStockView;
