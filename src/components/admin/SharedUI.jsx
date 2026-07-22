import React from "react";
import { getImageSrc } from "./adminHelpers";

export const SectionHeader = ({ title, subtitle, search, setSearch, buttonText, onButton }) => (
  <div className="admin-card-head">
    <div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
    <div className="admin-head-actions">
      {typeof setSearch === "function" && (
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input search"
        />
      )}
      {buttonText && <button type="button" onClick={onButton} className="admin-btn admin-btn-dark">{buttonText}</button>}
    </div>
  </div>
);

export const SummaryLine = ({ label, value }) => (
  <div className="admin-summary-line"><span>{label}</span><strong>{value || "-"}</strong></div>
);

export const EmptyBlock = ({ text }) => <div className="admin-empty-block">{text}</div>;

export const LoadingState = () => (
  <div className="admin-loading-grid">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="admin-card admin-skeleton" />
    ))}
  </div>
);

export const MonthSelect = ({ months, value, onChange }) => (
  <select className="admin-select month-select" value={value} onChange={(e) => onChange(e.target.value)}>
    {months.length ? (
      months.map((month) => (
        <option key={month.key} value={month.key}>{month.label}</option>
      ))
    ) : (
      <option value={value}>{value}</option>
    )}
  </select>
);

export const BarChart = ({ data = [], formatter }) => {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  if (!data.length) {
    return <div className="admin-empty-small">No revenue data for this month</div>;
  }

  return (
    <div className="admin-bars-clean">
      {data.map((item) => {
        const height = Math.max((Number(item.value || 0) / max) * 100, item.value > 0 ? 12 : 4);
        return (
          <div key={item.label} className="admin-bar-wrap-clean" title={`${item.label}: ${formatter ? formatter(item.value) : item.value}`}>
            <div className="admin-bar-clean" style={{ height: `${height}%` }} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export const FileImageInput = ({ label = "Image", value, preview, onFileChange, onClear }) => (
  <div className="admin-file-field wide">
    <label>{label}</label>
    <input
      className="admin-input"
      type="file"
      accept="image/*"
      onChange={(e) => onFileChange(e.target.files?.[0] || null)}
    />
    {(preview || value) && (
      <div className="admin-image-preview-row">
        <img src={preview || getImageSrc(value)} alt="Preview" />
        <button type="button" className="admin-btn admin-btn-light" onClick={onClear}>Remove image</button>
      </div>
    )}
    {value && !preview && <small>Current image is already saved.</small>}
  </div>
);
