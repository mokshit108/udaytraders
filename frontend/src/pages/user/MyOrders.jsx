import { useNavigate } from "react-router-dom";

const MyOrders = ({ orders }) => {
  const navigate = useNavigate();

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
      if (day > 3 && day < 21) return "th"; // For 4-20
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

  const handleTrackOrder = (order) => {
    navigate("/myorder/order-timeline", { state: { order } });
  };

  // Group orders by date and transaction ID
  const groupOrders = (orders) => {
    return orders.reduce((groupedOrders, order) => {
      const date = formatDate(order.created_at);
      const transactionId = order.order_id; // Assuming order_id is the unique transaction ID

      if (!groupedOrders[date]) {
        groupedOrders[date] = {};
      }

      if (!groupedOrders[date][transactionId]) {
        groupedOrders[date][transactionId] = { orders: [], finalAmount: 0 };
      }

      groupedOrders[date][transactionId].orders.push(order);
      groupedOrders[date][transactionId].finalAmount += parseFloat(
        order.final_amount
      );

      return groupedOrders;
    }, {});
  };

  const groupedOrders = groupOrders(orders);

  // Sort the grouped orders by date in descending order
  const sortedGroupedOrders = Object.entries(groupedOrders).sort(
    (a, b) => new Date(b[0]) - new Date(a[0])
  );

  // Sort orders within each transaction by created_at date and time in descending order
  sortedGroupedOrders.forEach(([date, transactions]) => {
    Object.values(transactions).forEach((transaction) => {
      transaction.orders.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    });
  });

  return (
    <div className="p-4 max-md:padding">
      {Array.isArray(orders) && orders.length > 0 ? (
        <>
          <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
            My Orders
          </h2>

          <div className="space-y-6">
            {sortedGroupedOrders.map(([date, transactions]) => (
              <div
                key={date}
                className="shadow-lg border border-double rounded-lg bg-white font-montserrat"
              >
                {/* Date Header */}
                <h3 className="text-xl font-semibold font-montserrat text-sky-700 my-5 ml-5">
                  {date}
                </h3>

                {Object.entries(transactions)
                  .sort(([, a], [, b]) => {
                    // Sort transactions by the most recent order's created_at date
                    const aLatestOrderTime = new Date(a.orders[0].created_at);
                    const bLatestOrderTime = new Date(b.orders[0].created_at);
                    return bLatestOrderTime - aLatestOrderTime; // Most recent first
                  })
                  .map(([transactionId, { orders }]) => (
                    <div
                      key={transactionId}
                      className="shadow border rounded-lg p-4 m-4 bg-gray-50"
                    >
                      {/* Track Button for the transaction */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 my-2 mx-2">
                        {/* Left side: Order Code */}
                        <p className="font-semibold font-montserrat text-gray-500">
                          <span className="mr-2">Order Code:</span>
                          {orders[0].o_code}
                        </p>

                        {/* Right side: Amount and Button */}
                        <div className="flex flex-col md:flex-row items-center gap-12">
                          <p className="font-semibold text-lg text-sky-700 font-montserrat">
                            <span className="mr-2">Amount:</span>₹
                            {orders[0].final_amount}
                          </p>
                          <button
                            className="bg-sky-950 text-white rounded-sm px-4 py-2 font-palanquin text-lg"
                            onClick={() => handleTrackOrder(orders[0])} // Assuming you want to track the first order
                          >
                            Track My Order
                          </button>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="sticky top-0 bg-white border p-4 justify-between flex md:text-center gap-2 max-md:hidden">
                        <div className="w-1/5 font-semibold text-gray-700"></div>
                        <div className="w-1/2 font-semibold text-gray-700">
                          Product
                        </div>
                        <div className="w-1/5 font-semibold text-gray-700">
                          Date
                        </div>
                        <div className="w-1/5 font-semibold text-gray-700">
                          Status
                        </div>
                        <div className="w-1/5 font-semibold text-gray-700">
                          Price
                        </div>
                        <div className="w-1/6 font-semibold text-gray-700">
                          Quantity
                        </div>
                      </div>

                      {/* Orders for each transaction */}
                      {orders.map((order, index) => (
                        <div
                          key={index}
                          className="shadow-lg border-double border bg-white font-montserrat"
                        >
                          {/* For larger screens */}
                          <div className="hidden md:block max-h-64 overflow-hidden">
                            <div
                              className="p-4 overflow-y-auto"
                              style={{ maxHeight: "calc(100% - 2rem)" }}
                            >
                              <div className="flex justify-between items-center gap-2 md:text-center">
                                <div className="w-1/5 flex md:justify-center">
                                  <img
                                    src={order.product_image}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                </div>
                                <div className="w-1/2 flex md:justify-center">
                                  {order.product_name}
                                </div>
                                <div className="w-1/5 flex md:justify-center">
                                  {formatDate(order.created_at)}
                                </div>
                                <div className="w-1/5 flex md:justify-center">
                                  <span
                                    className={`inline-block px-2 py-1 text-sm rounded-full ${getStatusBadgeClass(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <div className="w-1/5 flex md:justify-center">
                                  ₹{order.price}
                                </div>
                                <div className="w-1/6 flex md:justify-center">
                                  {order.quantity}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* For smaller screens */}
                          <div className="md:hidden p-4 text-base">
                            <div className="flex flex-col gap-2 items-center">
                              <img
                                src={order.product_image}
                                className="w-32 h-32 rounded-lg object-cover mb-2"
                              />
                              <div className="w-full">
                                <span className="font-semibold text-gray-700 mr-2">
                                  Product:
                                </span>{" "}
                                {order.product_name}
                              </div>
                              <div className="w-full">
                                <span className="font-semibold text-gray-700 mr-2">
                                  Date:
                                </span>{" "}
                                {formatDate(order.created_at)}
                              </div>
                              <div className="w-full">
                                <span className="font-semibold text-gray-700 mr-2">
                                  Status:
                                </span>
                                <span
                                  className={`inline-block px-2 py-1 text-sm rounded-full ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className="w-full">
                                <span className="font-semibold text-gray-700 mr-2">
                                  Price:
                                </span>{" "}
                                ₹{order.price}
                              </div>
                              <div className="w-full">
                                <span className="font-semibold text-gray-700 mr-2">
                                  Quantity:
                                </span>{" "}
                                {order.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-800 text-center font-palanquin text-3xl mb-6 max-md:text-2xl max-md:mt-32">
          You have no orders.
        </p>
      )}
    </div>
  );
};

export default MyOrders;
