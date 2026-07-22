import React, { useMemo, useState } from "react";
import { SectionHeader } from "./SharedUI";
import BookingGroupsTable from "./BookingGroupsTable";

const cleanStatus = (value) => String(value || "").trim().toLowerCase();

const FILTERS = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "overdue", label: "Overdue" },
  { id: "expired", label: "Expired" },
  { id: "returned", label: "Returned" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

const statusPriority = {
  overdue: 1,
  pending: 2,
  confirmed: 3,
  returned: 4,
  expired: 5,
  cancelled: 6,
  failed: 7,
};

const getDateValue = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortBookings = (items) => {
  return [...items].sort((a, b) => {
    const statusA = cleanStatus(a.bookingStatus);
    const statusB = cleanStatus(b.bookingStatus);
    const priorityA = statusPriority[statusA] || 99;
    const priorityB = statusPriority[statusB] || 99;

    if (priorityA !== priorityB) return priorityA - priorityB;

    const dateA = getDateValue(a.startDate || a.createdAt);
    const dateB = getDateValue(b.startDate || b.createdAt);

    if (["returned", "expired", "cancelled", "failed"].includes(statusA)) {
      return dateB - dateA;
    }

    return dateA - dateB;
  });
};

const filterBookings = (items, filter) => {
  if (filter === "all") return items;

  if (filter === "active") {
    return items.filter((booking) =>
      ["pending", "confirmed", "overdue"].includes(cleanStatus(booking.bookingStatus))
    );
  }

  if (filter === "cancelled") {
    return items.filter((booking) => ["cancelled", "failed"].includes(cleanStatus(booking.bookingStatus)));
  }

  return items.filter((booking) => cleanStatus(booking.bookingStatus) === filter);
};

const BookingsView = ({ bookings, search, setSearch, setSelectedBooking, updateGroupStatus, markBalancePaid, setReturnBooking, setActiveTab }) => {
  const [statusFilter, setStatusFilter] = useState("active");

  const sortedBookings = useMemo(() => sortBookings(bookings || []), [bookings]);

  const visibleBookings = useMemo(
    () => filterBookings(sortedBookings, statusFilter),
    [sortedBookings, statusFilter]
  );

  const counts = useMemo(() => {
    const base = {
      all: sortedBookings.length,
      active: 0,
      pending: 0,
      confirmed: 0,
      overdue: 0,
      expired: 0,
      returned: 0,
      cancelled: 0,
    };

    sortedBookings.forEach((booking) => {
      const status = cleanStatus(booking.bookingStatus);
      if (["pending", "confirmed", "overdue"].includes(status)) base.active += 1;
      if (base[status] !== undefined) base[status] += 1;
      if (status === "failed") base.cancelled += 1;
    });

    return base;
  }, [sortedBookings]);

  return (
    <div className="admin-card admin-section-card">
      <SectionHeader
        title="Bookings"
        subtitle="Active bookings are shown first. Expired, returned, and cancelled bookings are kept under filters."
        search={search}
        setSearch={setSearch}
        buttonText="Add On Site Booking"
        onButton={() => setActiveTab("onsite")}
      />

      <div className="admin-filter-row" style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 18px" }}>
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`admin-btn ${statusFilter === filter.id ? "admin-btn-dark" : "admin-btn-light"}`}
          >
            {filter.label} ({counts[filter.id] || 0})
          </button>
        ))}
      </div>

      <BookingGroupsTable
        bookings={visibleBookings}
        setSelectedBooking={setSelectedBooking}
        updateGroupStatus={updateGroupStatus}
        markBalancePaid={markBalancePaid}
        setReturnBooking={setReturnBooking}
      />
    </div>
  );
};

export default BookingsView;
