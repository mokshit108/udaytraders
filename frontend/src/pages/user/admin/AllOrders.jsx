import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [openDropdown, setOpenDropdown] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  const fetchOrders = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/admin/allorders`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/all-agents`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data.agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setErrorMessage("Failed to fetch agents.");
    }
  };

  const handleAgentAssignment = async (orderId, agentId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/profile/orders/assign-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, agentId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      // Display success message from the API response
      setSuccessMessage(data.message || "Agent assigned successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchOrders();
    } catch (error) {
      console.error("Error assigning agent:", error);
      // Display error message from the API response
      setErrorMessage(error.message || "Failed to assign agent.");
      setTimeout(() => setErrorMessage(""), 3000); // Clear error message after 3 seconds
    }
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
  // const handleStatusChange = async (orderId, newStatus) => {
  //   try {
  //     const apiUrl = import.meta.env.VITE_API_URL;
  //     const response = await fetch(
  //       `${apiUrl}/profile/admin/update-order-status`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ orderId, status: newStatus }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.statusText}`);
  //     }

  //     //const data = await response.json();

  //     setOrders((prevOrders) =>
  //       prevOrders.map((order) =>
  //         order.order_id === orderId ? { ...order, status: newStatus } : order
  //       )
  //     );
  //     setOpenDropdown(null);
  //     fetchOrders();
  //   } catch (error) {
  //     console.error("Error updating order status:", error);
  //   }
  // };

  const groupOrdersByUserAndOrderId = () => {
    return orders.reduce((groupedOrders, order) => {
      const user = order.user;
      const orderId = order.order_id; // Assuming order_id is unique for each order

      if (!groupedOrders[user]) {
        groupedOrders[user] = {};
      }

      if (!groupedOrders[user][orderId]) {
        groupedOrders[user][orderId] = {
          items: [],
          assignedAgentId: order.assignedAgentId,
          status: order.status,
          ocode: order.o_code,
          createdAt: order.created_at,
          shippingAt: order.shipping_date,
          deliveryAt: order.delivery_date,
          finalAmount: order.final_amount,
          discountPercentage: order.discount_percentage,
        };
      }

      groupedOrders[user][orderId].items.push(order);
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
        All Orders
      </h2>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{errorMessage}</p>
        </div>
      )}
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
          {Object.entries(groupedOrders).map(([user, userOrders]) => (
            <div
              key={user}
              className="shadow-lg border border-double rounded-lg bg-white font-montserrat p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-sky-700">
                User: {user}
              </h3>
              <div className="space-y-4">
                {Object.entries(userOrders).map(([orderId, order]) => (
                  <div
                    key={orderId}
                    className="shadow border rounded-lg p-4 bg-gray-50"
                  >
                    <select
                      className="border border-gray-300 rounded px-4 py-2"
                      onChange={(e) =>
                        handleAgentAssignment(orderId, e.target.value)
                      }
                      value={
                        userOrders[orderId]?.items[0]?.assignedagentid || ""
                      } // Set selected value based on assignedAgentId
                    >
                      {/* Display Assigned Agent option if assignedagentid exists */}
                      {userOrders[orderId]?.items[0]?.assignedagentid ? (
                        <option value="" disabled>
                          Assigned Agent:{" "}
                          {
                            // Find the agent name based on assignedAgentId
                            agents.find(
                              (agent) =>
                                agent.id ===
                                userOrders[orderId].items[0].assignedagentid
                            )?.name || "Unknown"
                          }
                        </option>
                      ) : (
                        <option value="" disabled>
                          Select Agent
                        </option>
                      )}

                      {/* Loop through agents and display them in the dropdown */}
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>

                    <div>
                      <p className="font-xl font-semibold font-montserrat text-gray-500">
                        Code: {order.ocode}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center md:text-sm lg:text-md justify-between text-center p-4">
                      <span
                        // onClick={() =>
                        //     setOpenDropdown(
                        //       openDropdown === orderId ? null : orderId
                        //     )
                        //   }
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
                        Discount: {order.discountPercentage}%
                      </p>
                      <p className="font-semibold text-sky-700">
                        Date: {formatDate(order.createdAt)}
                      </p>
                      <button
                        className="bg-sky-950 text-white rounded-sm px-4 py-2 font-palanquin text-lg"
                        onClick={() => handleOrderClick(order)} // Assuming you want to track the first order
                      >
                        Track Order
                      </button>
                      {/* {openDropdown === orderId && (
                        <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md mt-1">
                          {[
                            "Pending",
                            "Shipped",
                            "Delivered",
                            "Cancelled",
                            "Returned",
                            "Refunded",
                          ].map((status) => (
                            <div
                              key={status}
                              onClick={() =>
                                handleStatusChange(orderId, status)
                              }
                              className="p-2 cursor-pointer hover:bg-gray-200 w-1/4"
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )} */}
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
                        <p className="font-semibold text-gray-700 w-full md:w-[45%] text-left md:text-center">
                          <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">
                            Product:
                          </span>
                          {item.product_name}
                        </p>
                        <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                          <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">
                            Company:
                          </span>
                          {item.company_name}
                        </p>
                        <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                          <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">
                            Price:
                          </span>
                          ₹{item.price}
                        </p>
                        <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                          <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">
                            Quantity:
                          </span>
                          {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No orders found.</div>
      )}
    </div>
  );
};

export default AllOrders;
