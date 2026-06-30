import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faShippingFast,
  faBoxOpen,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const AdminOrderTimeline = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  // State for handling editable dates and order status
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isEditingDelivered, setIsEditingDelivered] = useState(false);
  const [shippingDate, setShippingDate] = useState(order.shippingAt || "");
  const [deliveredDate, setDeliveredDate] = useState(order.deliveryAt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(
    order.status || "Pending"
  );
  const prevStatusRef = useRef(selectedStatus);

  // Function to fetch order ID
  const orderId = order?.items[0]?.order_id;

  // Ensure order is available before proceeding
  if (!order) {
    return <div className="text-center p-4">No order data available.</div>;
  }

  // Update order status whenever selectedStatus changes
  useEffect(() => {
    const updateOrderStatus = async () => {
      if (!orderId) return; // Avoid running if orderId is not available
      if (prevStatusRef.current !== selectedStatus) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;

          const response = await fetch(
            `${apiUrl}/profile/admin/update-order-status`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderId, status: selectedStatus }),
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const data = await response.json();

          setSuccessMessage(data.message);
          setTimeout(() => setSuccessMessage(""), 3000);
          isCompleted((order.status = selectedStatus));
          setOpenDropdown(null);
        } catch (error) {
          setError("Failed to update order status: " + error.message);
        }
        // Update the ref to the current status after the update
        prevStatusRef.current = selectedStatus;
      }
    };

    updateOrderStatus();
  }, [selectedStatus, orderId]); // Use orderId instead of order.items[0].order_id

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const daySuffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return `${day}${daySuffix} ${month} ${year}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-200 text-yellow-800";
      case "Shipped":
        return "bg-blue-200 text-blue-800";
      case "Delivered":
        return "bg-green-200 text-green-800";
      case "Cancelled":
        return "bg-red-200 text-red-800";
      case "Returned":
        return "bg-purple-200 text-purple-800";
      case "Refunded":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const processedDate = formatDate(order.createdAt);

  const isCompleted = (status) => {
    if (order.status === "Delivered") return true;
    if (order.status === "Shipped" && status !== "Delivered") return true;
    if (order.status === "Pending" && status === "Pending") return true;
    return false;
  };

  const navigatemyorder = () => {
    navigate("/profile/admin/all-orders");
  };

  const saveShippingDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const firstOrderItem = order.items[0];
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/update-shipping-date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: firstOrderItem.order_id,
            shippingDate: shippingDate,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditingShipping(false);
    } catch (error) {
      setError("Failed to update shipping date: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDeliveredDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const firstOrderItem = order.items[0];
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${apiUrl}/profile/admin/update-delivery-date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: firstOrderItem.order_id,
            deliveryDate: deliveredDate,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditingDelivered(false);
    } catch (error) {
      setError("Failed to update delivery date: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start padding">
      <div className="relative w-full max-w-md bg-white border border-gray-300 shadow-3xl shadow-slate-200 rounded-lg mt-10 p-6">
        <button
          className="absolute top-4 left-4 text-sky-700 hover:text-sky-900"
          onClick={navigatemyorder}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>

        {/* Status Update Dropdown */}
        <div className="flex items-center relative p-4 mt-8 bg-sky-50">
          <span
            onClick={() =>
              setOpenDropdown(openDropdown === orderId ? null : orderId)
            }
            className={`inline-block px-4 py-2 text-sm rounded-full cursor-pointer ${getStatusBadgeClass(
              selectedStatus
            )}`}
          >
            {selectedStatus}
          </span>
          {openDropdown === orderId && (
            <ul className="absolute mt-1 border-gray-200 border-2 w-28 text-center bg-white rounded-lg shadow-lg z-10">
              {[
                "Pending",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Returned",
                "Refunded",
              ].map((status) => (
                <li
                  key={status}
                  className={`px-4 m-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 ${getStatusBadgeClass(
                    status
                  )} ${selectedStatus === status ? "ring-2 ring-sky-500" : ""}`} // Highlight the selected status
                  onClick={() => {
                    setSelectedStatus(status);
                    setOpenDropdown(null); // Close the dropdown after selection
                  }}
                >
                  {status}
                </li>
              ))}
            </ul>
          )}
          <h4 className="text-lg font-bold font-montserrat text-sky-700 ml-3">
            Update Order Status
          </h4>
        </div>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4">
            <p>{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center relative px-10 pt-10">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full border-2 ${
                isCompleted("Pending")
                  ? "border-yellow-500 bg-yellow-500"
                  : "border-gray-300 bg-white"
              } flex items-center justify-center`}
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={`${
                  isCompleted("Pending") ? "text-white" : "text-gray-400"
                } text-xl`}
              />
            </div>
            <div
              className={`w-1 h-16 ${
                isCompleted("Shipped") ? "bg-sky-600" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="ml-4 -mt-8 font-montserrat">
            <h4 className="text-lg font-bold text-sky-700">Order Placed</h4>
            <p className="text-sm text-black">
              Order was placed on {processedDate}
            </p>
          </div>
        </div>
        {/* Order Shipped */}
        <div className="flex items-center relative px-10">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full border-2 ${
                isCompleted("Shipped")
                  ? "border-sky-600 bg-sky-600"
                  : "border-gray-300 bg-white"
              } flex items-center justify-center`}
            >
              <FontAwesomeIcon
                icon={faShippingFast}
                className={`${
                  isCompleted("Shipped") ? "text-white" : "text-gray-400"
                } text-xl`}
              />
            </div>
            <div
              className={`w-1 h-16 ${
                isCompleted("Delivered") ? "bg-sky-600" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="ml-4 -mt-8 font-montserrat">
            <h4 className="text-lg font-bold text-sky-700">Shipped</h4>
            {isEditingShipping ? (
              <div className="flex items-center ml-2">
                <input
                  type="date"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                  className="border border-gray-300 rounded p-1 ml-2"
                  min={new Date(order.createdAt).toISOString().split("T")[0]}
                  max={deliveredDate || undefined}
                />
                <button
                  onClick={saveShippingDate}
                  className="ml-2 bg-sky-950 text-white rounded-sm px-2 py-2"
                  disabled={loading}
                >
                  Update
                </button>
              </div>
            ) : (
              <p className="text-sm font-montserrat text-black">
                {order.status === "Pending"
                  ? `Order is expected to ship on ${formatDate(shippingDate)}`
                  : `Order was shipped on ${formatDate(shippingDate)}`}
                {order.status == "Pending" && (
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="text-gray-500 ml-2 cursor-pointer"
                    onClick={() => setIsEditingShipping(true)}
                  />
                )}
              </p>
            )}
          </div>
        </div>
        {/* Order Delivered */}
        <div className="flex items-center relative px-10 pb-10">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 -mt-6 h-10 rounded-full border-2 ${
                isCompleted("Delivered")
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300 bg-white"
              } flex items-center justify-center`}
            >
              <FontAwesomeIcon
                icon={faBoxOpen}
                className={`${
                  isCompleted("Delivered") ? "text-white" : "text-gray-400"
                } text-xl`}
              />
            </div>
          </div>
          <div className="ml-4 font-montserrat">
            <h4 className="text-lg font-bold text-sky-700">Delivered</h4>
            {isEditingDelivered ? (
              <div className="flex items-center ml-2">
                <input
                  type="date"
                  value={deliveredDate}
                  onChange={(e) => setDeliveredDate(e.target.value)}
                  className="border border-gray-300 rounded p-1 ml-2"
                  min={
                    shippingDate
                      ? new Date(shippingDate).toISOString().split("T")[0]
                      : undefined
                  }
                />
                <button
                  onClick={saveDeliveredDate}
                  className="ml-2 bg-sky-950 text-white rounded-sm px-2 py-2"
                  disabled={loading}
                >
                  Update
                </button>
              </div>
            ) : (
              <p className="text-sm font-montserrat text-black">
                {order.status === "Pending" || order.status === "Shipped"
                  ? `Order is yet to be delivered on ${formatDate(
                      deliveredDate
                    )}.`
                  : `Order was delivered on ${formatDate(deliveredDate)}`}
                {order.status !== "Delivered" && (
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="text-gray-500 ml-2 cursor-pointer"
                    onClick={() => setIsEditingDelivered(true)}
                  />
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderTimeline;
