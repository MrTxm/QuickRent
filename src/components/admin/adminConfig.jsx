import React from "react";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaBoxes,
  FaPlusCircle,
  FaTags,
  FaUsers,
  FaMapMarkerAlt,
  FaChartPie,
  FaExclamationTriangle,
} from "react-icons/fa";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { id: "bookings", label: "Bookings", icon: <FaCalendarCheck /> },
  { id: "inventory", label: "Inventory", icon: <FaBoxes /> },
  { id: "addProduct", label: "Add Product", icon: <FaPlusCircle /> },
  { id: "addCategory", label: "Add Category", icon: <FaTags /> },
  { id: "customers", label: "Customers", icon: <FaUsers /> },
  { id: "onsite", label: "On Site", icon: <FaMapMarkerAlt /> },
  { id: "damageStock", label: "Damage Stock", icon: <FaExclamationTriangle /> },
  { id: "reports", label: "Reports", icon: <FaChartPie /> },
];

export const emptyProductForm = {
  product_id: "",
  name: "",
  description: "",
  pricePerDay: "",
  category_id: "",
  image: "",
  imageFile: null,
  imagePreview: "",
  available: "",
  damaged: "",
};

export const emptyCategoryForm = {
  category_id: "",
  name: "",
  description: "",
  image: "",
  imageFile: null,
  imagePreview: "",
};

export const emptyOnSiteForm = {
  productMongoId: "",
  customerName: "",
  gmail: "",
  contactNumber: "",
  nic: "",
  province: "",
  city: "",
  address: "",
  startDate: "",
  endDate: "",
  quantity: 1,
};
