import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faShippingFast,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const AgentOrderTimeline = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [shippingDate, setShippingDate] = useState(order.shippingAt || "");
  const [deliveredDate, setDeliveredDate] = useState(order.deliveryAt || "");
  const [selectedStatus, setSelectedStatus] = useState(
    order.status || "Pending"
  );

  const [enteredCode, setEnteredCode] = useState(""); // OTP code input// Track OTP validation

  const prevStatusRef = useRef(selectedStatus);

  // Function to fetch order ID
  const orderId = order?.items[0]?.order_id;
  // Ensure order is available before proceeding
  if (!order) {
    return <div className="text-center p-4">No order data available.</div>;
  }

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
  }, [selectedStatus, orderId]);

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
      case "Delivered":
        return "bg-green-200 text-green-800";
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

  const navigateToOrders = () => {
    navigate("/profile/agent/all-orders");
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    // Check if a code is entered
    if (!enteredCode) {
      setError("Please enter a verification code.");
      setSuccessMessage("");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      // Make a POST request to the verifyOrderCode API
      const response = await fetch(`${apiUrl}/profile/agent/verifycode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderCode: enteredCode }),
      });

      const data = await response.json();

      // Handle API response
      if (response.ok) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(""), 3000);
        setError(null);
        // Optionally: Store or handle the returned order details
      } else {
        setError(error.message || "Failed to assign agent.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setError("Server error. Please try again later.");
      setSuccessMessage("");
    }
  };

  return (
    <>
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
      <div className="flex justify-center items-start padding">
        <div className="relative w-full max-w-md bg-white border border-gray-300 shadow-3xl shadow-slate-200 rounded-lg mt-10 p-6">
          <button
            className="absolute top-4 left-4 text-sky-700 hover:text-sky-900"
            onClick={navigateToOrders}
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>

          <p className="mt-10 font-montserrat max-md:text-sm text-md font-medium text-black bg-white rounded-lg border-sky-700 border-solid border-2 shadow-md p-4 mb-5 transform transition-transform hover:-translate-y-1">
            <span className="text-lg max-md:text-sm font-semibold font-montserrat text-sky-700 mr-2">
              Note:
            </span>
            Collect the{" "}
            <span className="font-lg font-semibold font-montserrat text-slate-700">
              Order Code
            </span>{" "}
            to verify the customer and mark the order as delivered.
          </p>
          {/* OTP Verification Form */}
          <form onSubmit={handleCodeSubmit} className="my-6 mt-8">
            <h3 className="text-lg font-bold font-montserrat text-sky-700 mb-2">
              Enter Order Verification Code
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                maxLength="12"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500"
                placeholder="Enter 12-digit code"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-sky-700"
              >
                Verify
              </button>
            </div>
          </form>

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
                {/* Only one status option: Delivered */}
                <li
                  key="Delivered"
                  className={`px-4 m-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 ${getStatusBadgeClass(
                    "Delivered"
                  )} ${
                    selectedStatus === "Delivered" ? "ring-2 ring-sky-500" : ""
                  }`} // Highlight the selected status
                  onClick={() => {
                    setSelectedStatus("Delivered");
                    setOpenDropdown(null); // Close the dropdown after selection
                  }}
                >
                  Delivered
                </li>
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

          {/* Timeline */}
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
              <p className="text-sm font-montserrat text-black">
                {order.status === "Pending"
                  ? `Order is expected to ship on ${formatDate(shippingDate)}`
                  : `Order was shipped on ${formatDate(shippingDate)}`}
              </p>
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

              <p className="text-sm font-montserrat text-black">
                {order.status === "Pending" || order.status === "Shipped"
                  ? `Order is yet to be delivered on ${formatDate(
                      deliveredDate
                    )}.`
                  : `Order was delivered on ${formatDate(deliveredDate)}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentOrderTimeline;
