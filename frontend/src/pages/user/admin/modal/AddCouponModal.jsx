import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddCouponModal = ({ isOpen, onClose, onCouponAdded }) => {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const tableName = "Coupon";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!couponCode || !discount || !expiryDate) {
      setError("All fields are required.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/crud/new/${tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          discount: parseFloat(discount),
          expiryDate: new Date(expiryDate).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setCouponCode("");
      setDiscount("");
      setExpiryDate("");
      onCouponAdded(); // Call the handler to refresh the coupon list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding coupon:", error);
      setError("Failed to add coupon. Please try again.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 relative w-full max-w-md">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="text-lg font-bold mb-4">Add New Coupon</h3>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="couponCode">
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="discount">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                  min="0"
                  max="100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="expiryDate">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-sky-950 text-white px-4 py-2 rounded"
                >
                  Add Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCouponModal;