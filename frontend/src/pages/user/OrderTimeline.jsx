import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faShippingFast,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const OrderTimeline = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    return <div className="text-center p-4">No order data available.</div>;
  }

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

  const processedDate = formatDate(order.created_at);
  const shippedDate = formatDate(order.shipping_date);
  const deliveredDate = formatDate(order.delivery_date);

  const isCompleted = (status) => {
    if (order.status === "Delivered") return true;
    if (order.status === "Shipped" && status !== "Delivered") return true;
    if (order.status === "Pending" && status === "Pending") return true;
    return false;
  };

  const navigatemyorder = () => {
    navigate("/profile/orders");
  };

  return (
    <div className="flex justify-center items-start padding-top">
      <div className="relative w-full max-w-md bg-white border border-gray-300 shadow-xl m-6 rounded-lg mt-10 p-6">
        {/* Back Arrow to My Orders */}
        <button
          className="absolute top-4 left-4 text-sky-700 hover:text-sky-900"
          onClick={navigatemyorder}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        {/* Order Placed */}
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
          <div className="ml-4">
            <h4 className="text-lg font-bold text-sky-700">Order Placed</h4>
            <p>Order was placed on {processedDate}</p>
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
                isCompleted("Delivered") ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-bold text-sky-700">Shipped</h4>
            <p>
              {order.status === "Pending"
                ? `Order is expected to ship on ${shippedDate}`
                : `Order was shipped on ${shippedDate}`}
            </p>
          </div>
        </div>

        {/* Order Delivered */}
        <div className="flex items-center relative px-10 pb-10">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full border-2 ${
                isCompleted("Delivered")
                  ? "border-green-600 bg-green-600"
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
          <div className="ml-4">
            <h4 className="text-lg font-bold text-sky-700">Delivered</h4>
            <p>
              {order.status === "Delivered"
                ? `Order was delivered on ${deliveredDate}`
                : `Order is expected on ${
                    deliveredDate !== "N/A" ? deliveredDate : "N/A"
                  }`}
            </p>
          </div>
        </div>
        {/* Note to customer */}
        <div className="mt-2 text-center text-gray-600">
          <p className="font-montserrat font-medium text-sm">
            *We recommend checking your order status on a daily basis for the
            latest updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
