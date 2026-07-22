import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SavedAddressPicker = ({ user, onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/address/${user._id}`);
        setAddresses(res.data || []);
      } catch (error) {
        console.error("ADDRESS PICKER ERROR:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user?._id]);

  const handleSelect = (address) => {
    setSelectedAddressId(address._id);

    onSelect({
      customerName: address.fullName || "",
      contactNumber: address.contactNumber || "",
      province: address.province || "",
      city: address.city || "",
      address: address.address || "",
    });

    toast.success("Saved address applied");
  };

  if (!user?._id) return null;

  return (
    <div className="border border-blue-100 bg-blue-50 rounded-2xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Use Saved Address</h3>
          <p className="text-sm text-gray-600">
            Select an address from your profile to fill booking details quickly.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading saved addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500">
          No saved address found. You can still fill the booking form manually.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((address) => {
            const selected = selectedAddressId === address._id;

            return (
              <button
                key={address._id}
                type="button"
                onClick={() => handleSelect(address)}
                className={`text-left rounded-xl border p-4 transition ${
                  selected
                    ? "border-blue-600 bg-white shadow-md"
                    : "border-white bg-white/70 hover:bg-white hover:shadow"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {address.fullName || "Saved Address"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.address}, {address.city}, {address.province}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {address.contactNumber}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selected ? "Selected" : "Use"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedAddressPicker;
