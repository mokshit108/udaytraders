import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [openDropdown, setOpenDropdown] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

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
      const orderId = order.order_id;

      if (!groupedOrders[user]) {
        groupedOrders[user] = {
          _meta: {
            userEmail: order.user_email,
            userRole: order.user_role,
            userRoleId: order.user_role_id,
          },
          orders: {},
        };
      }

      if (!groupedOrders[user].orders[orderId]) {
        groupedOrders[user].orders[orderId] = {
          items: [],
          status: order.status,
          ocode: order.o_code,
          createdAt: order.created_at,
          shippingAt: order.shipping_date,
          deliveryAt: order.delivery_date,
          finalAmount: order.final_amount,
        };
      }

      groupedOrders[user].orders[orderId].items.push(order);
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
          {Object.entries(groupedOrders).map(([user, userData]) => {
            const { _meta, orders: userOrders } = userData;
            const roleBadgeClass =
              _meta.userRoleId === 1
                ? "bg-red-100 text-red-700"
                : _meta.userRoleId === 2
                ? "bg-purple-100 text-purple-700"
                : "bg-sky-100 text-sky-700";
            const roleLabel =
              _meta.userRoleId === 1
                ? "Admin"
                : _meta.userRoleId === 2
                ? "Partner"
                : "Customer";
            return (
              <div
                key={user}
                className="shadow-lg border border-double rounded-lg bg-white font-montserrat p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-sky-700">
                    {user}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                  {_meta.userEmail && (
                    <span className="text-sm text-gray-400">{_meta.userEmail}</span>
                  )}
                </div>
                <div className="space-y-4">
                  {Object.entries(userOrders).map(([orderId, order]) => (
                    <div
                      key={orderId}
                      className="shadow border rounded-lg p-4 bg-gray-50"
                    >
                      <div>
                        <p className="font-xl font-semibold font-montserrat text-gray-500">
                          Code: {order.ocode}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row items-center md:text-sm lg:text-md justify-between text-center p-4">
                        <span
                          className={`inline-block px-4 py-2 text-sm rounded-full ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="font-semibold text-sky-700">
                          Amount: ₹{Number(order.finalAmount).toFixed(2)}
                        </p>
                        <p className="font-semibold text-sky-700">
                          Date: {formatDate(order.createdAt)}
                        </p>
                        <button
                          className="bg-sky-950 text-white rounded-sm px-4 py-2 font-palanquin text-lg"
                          onClick={() => handleOrderClick(order)}
                        >
                          Track Order
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
                          <p className="font-semibold text-gray-700 w-full md:w-[45%] text-left md:text-center">
                            <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">Product:</span>
                            {item.product_name}
                          </p>
                          <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                            <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">Company:</span>
                            {item.company_name}
                          </p>
                          <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                            <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">Price:</span>
                            ₹{item.price}
                          </p>
                          <p className="font-semibold text-gray-600 w-full md:w-1/5 text-left md:text-center">
                            <span className="md:hidden font-semibold text-gray-700 text-center mb-2 mr-2">Quantity:</span>
                            {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center">No orders found.</div>
      )}
    </div>
  );
};

export default AllOrders;
