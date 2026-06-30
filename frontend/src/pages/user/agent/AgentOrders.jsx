import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const AgentOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentId, setAgentId] = useState(null);

  const navigate = useNavigate();
  const userId = user.id;

  useEffect(() => {
    const fetchAgentId = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = sessionStorage.getItem("token");

      try {
        const agentResponse = await fetch(
          `${apiUrl}/profile/agentid/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!agentResponse.ok) {
          throw new Error("Failed to fetch agent data");
        }

        const agentData = await agentResponse.json();
        setAgentId(agentData.agent.id); // Correctly set agentId
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setError(error.message);
      }
    };

    fetchAgentId();
  }, [userId]);

  // Only fetch orders when the agentId is set
  useEffect(() => {
    const fetchOrders = async () => {
      if (!agentId) return; // Prevent making a request if agentId is not yet set

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/profile/agent/${agentId}`);

        // if (!response.ok) {
        //   throw new Error(`Error: ${response.statusText}`);
        // }

        const data = await response.json();
        if (data.message) {
          setOrders([]); // If no orders, set an empty array
         // Set the error message from API
        } else {
          setOrders(data.orders); // Assuming the response has an 'orders' field
        }
      } catch (error) {
        console.error("Error fetching agent orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [agentId]); // Trigger fetchOrders when agentId is updated

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    const getDaySuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getDaySuffix(day)} ${month} ${year}`;
  };

  // Group orders by both userId and orderId
  const groupOrdersByUserAndOrderId = () => {
    return orders.reduce((groupedOrders, order) => {
      const userId = order.user; // Use 'user' as the field for the user's name (from the API response)
      const orderId = order.order_id;

      if (!groupedOrders[userId]) {
        groupedOrders[userId] = {};
      }

      if (!groupedOrders[userId][orderId]) {
        groupedOrders[userId][orderId] = {
          items: [],
          user: order.user, // Use the user from the API response
          status: order.status,
          createdAt: order.created_at,
          shippingAt: order.shipping_date,
          deliveryAt: order.delivery_date,
          finalAmount: order.final_amount,
        };
      }

      groupedOrders[userId][orderId].items.push(order);
      return groupedOrders;
    }, {});
  };

  const groupedOrders = groupOrdersByUserAndOrderId();

  const handleOrderClick = (order) => {
    navigate("order-timeline", { state: { order } });
  };

  return (
    <div className="p-4 max-md:padding">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        Agent Orders
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-screen w-full">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-sky-900"
          />
          <span className="ml-2">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Object.keys(groupedOrders).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedOrders).map(([userId, userOrders]) => (
            <div
              key={userId}
              className="shadow-lg border border-double rounded-lg bg-white font-montserrat p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-sky-700">
                User: {userId}
              </h3>
              <div className="space-y-4">
                {Object.entries(userOrders).map(([orderId, order]) => (
                  <div
                    key={orderId}
                    className="shadow border rounded-lg p-4 bg-gray-50"
                  >

                    <div className="flex flex-col md:flex-row items-center md:text-sm lg:text-md justify-between text-center p-4">
                      <span
                        className={`inline-block px-4 py-2 text-sm rounded-full ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <p className="font-semibold text-sky-700">
                        Amount: ₹{order.finalAmount}
                      </p>
                      <p className="font-semibold text-sky-700">
                        Date: {formatDate(order.createdAt)}
                      </p>
                      <button
                        className="bg-sky-950 text-white rounded-sm px-4 py-2 font-palanquin text-lg"
                        onClick={() => handleOrderClick(order)}
                      >
                        Update Order Status
                      </button>
                    </div>

                    <div className="hidden md:flex border-b-2 pb-2 mb-4 font-semibold text-gray-700 text-center items-center">
                      <div className="w-1/6"></div>
                      <div className="w-[45%]">Product</div>
                      <div className="w-1/5">Company</div>
                      <div className="w-1/5">Price</div>
                      <div className="w-1/5">Quantity</div>
                    </div>
                    {order.items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex flex-col md:flex-row items-center justify-between text-center py-4 border-b-2"
                      >
                        <div className="w-full md:w-1/6">
                          <img
                            src={item.product_image}
                            className="md:w-16 md:h-16 w-32 rounded-lg object-cover mx-auto mb-2 md:m-0"
                            alt={item.product_name}
                          />
                        </div>
                        <p className="font-semibold text-gray-700 w-full md:w-[45%]">
                          {item.product_name}
                        </p>
                        <p className="w-[20%] text-gray-700">
                          {item.company_name}
                        </p>
                        <p className="w-[15%] text-gray-700">₹{item.price}</p>
                        <p className="w-[15%] text-gray-700">{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-800 text-center font-palanquin text-2xl mb-6 max-md:text-2xl">No orders found for this agent</p>
      )}
    </div>
  );
};

export default AgentOrders;
