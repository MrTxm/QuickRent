import React from "react";
import { FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";
import { EmptyBlock, SectionHeader } from "./SharedUI";

const CustomersView = ({ users, search, setSearch, updateUserRole, updateUserActive, deleteUser }) => (
  <div className="admin-card admin-section-card">
    <SectionHeader title="Customers" subtitle="View all users, role access and account activity." search={search} setSearch={setSearch} />
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>NIC</th><th>Status</th><th>Role</th><th>Action</th></tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td><strong>{user.fullName}</strong><small>{user.isActive ? "Active user" : "Non-active user"}</small></td>
              <td>{user.email}</td>
              <td>{user.contactNumber}</td>
              <td>{user.nic}</td>
              <td><span className={`admin-status ${user.isActive ? "admin-status-confirmed" : "admin-status-expired"}`}>{user.isActive ? "Active" : "Non-active"}</span></td>
              <td>
                <select className="admin-select mini" value={user.role || "user"} onChange={(e) => updateUserRole(user._id, e.target.value)}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <div className="admin-action-stack horizontal">
                  <button type="button" className="admin-btn admin-btn-green" onClick={() => updateUserActive(user._id, true)}><FaCheckCircle /> Active</button>
                  <button type="button" className="admin-btn admin-btn-light" onClick={() => updateUserActive(user._id, false)}><FaTimesCircle /> Non-active</button>
                  <button type="button" className="admin-btn admin-btn-danger" onClick={() => deleteUser(user._id)}><FaTrash /> Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!users.length && <EmptyBlock text="No users found" />}
    </div>
  </div>
);

export default CustomersView;
