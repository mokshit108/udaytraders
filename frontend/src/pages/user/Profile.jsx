import { useEffect, useState } from "react";
import { useLocation, Route, Routes, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import ProfileOverview from "./ProfileOverview";
import MyOrders from "./MyOrders";
import AllOrders from "./admin/AllOrders";
import AllProducts from "./admin/AllProducts";
import AllUsers from "./admin/AllUsers";
import AllContactMessages from "./admin/AllContactMessages";
import AllCategories from "./admin/AllCategories";

import AllPayments from "./admin/AllPayments";
import AllCompanies from "./admin/AllCompanies";
import OrderStatus from "./admin/OrderStatus"; // Import the OrderStatus component
import AdminOrderTimeline from "./admin/AdminOrderTimeline";
import AgentOrders from "./agent/AgentOrders";
import AgentOrderTimeline from "./agent/AgentOrderTimeline";

const Profile = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const userId = sessionStorage.getItem("id");

        if (!userId) {
          // Handle case where userId is not available
          return;
        }

        // Fetch profile data
        const profileResponse = await fetch(
          `${apiUrl}/profile?userId=${userId}`
        );
        const profileData = await profileResponse.json();
        setUser(profileData.user);

        // Fetch orders data
        const ordersResponse = await fetch(
          `${apiUrl}/profile/orders-details?userId=${userId}`
        );
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="padding-top flex flex-col md:flex-row min-h-screen">
      {/* Left Navigation for large screens */}
      <aside className="hidden md:block lg:w-1/4 bg-white text-center p-4 font-palanquin text-xl font-semibold">
        <ul className="space-y-4">
          <li>
            <Link
              to="/profile"
              className={`block p-2 text-lg hover:text-cyan-600 ${
                location.pathname === "/profile"
                  ? "bg-sky-950 text-white rounded-sm px-4 py-2"
                  : "text-sky-900"
              }`}
            >
              Profile Overview
            </Link>
          </li>

          {user && user.role_id === 1 ? ( // Check if user exists and role_id is 1
            <>
              <li>
                <Link
                  to="/profile/admin/all-orders"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-orders"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/admin/order-status"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/order-status"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  Order Status
                </Link>
              </li>
              <hr className="my-4 border-gray-300" />
              <li>
                <Link
                  to="/profile/admin/all-products"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-products"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/admin/all-users"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-users"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Users
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/admin/all-messages"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-messages"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Contact Messages
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/admin/all-categories"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-categories"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/admin/all-companies"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-companies"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Company
                </Link>
              </li>

              <li>
                <Link
                  to="/profile/admin/all-payments"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/admin/all-payments"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  All Payments
                </Link>
              </li>
            </>
          ) : user && user.role_id === 3 ? ( // Agent View
            <>
              <li>
                <Link
                  to="/profile/agent/all-orders"
                  className={`block p-2 text-lg hover:text-cyan-600 ${
                    location.pathname === "/profile/agent/all-orders"
                      ? "bg-sky-950 text-white"
                      : "text-sky-900"
                  }`}
                >
                  Assigned Orders
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/profile/orders"
                className={`block p-2 text-lg hover:text-cyan-600 ${
                  location.pathname === "/profile/orders"
                    ? "bg-sky-950 text-white"
                    : "text-sky-900"
                }`}
              >
                My Orders
              </Link>
            </li>
          )}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-screen w-full mt-[-100px]">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-4xl text-sky-900"
            />
          </div>
        ) : (
          // Display the appropriate section based on the route
          <Routes>
            <Route path="/" element={<ProfileOverview user={user} />} />

            {user && user.role_id === 1 ? ( // Check if user exists and role_id is 1
              <>
                <Route path="admin/all-orders" element={<AllOrders />} />
                <Route path="admin/order-status" element={<OrderStatus />} />
                <Route path="admin/all-products" element={<AllProducts />} />
                <Route path="admin/all-users" element={<AllUsers />} />
                <Route
                  path="admin/all-messages"
                  element={<AllContactMessages />}
                />
                <Route
                  path="admin/all-categories"
                  element={<AllCategories />}
                />
                <Route path="admin/all-companies" element={<AllCompanies />} />

                <Route path="admin/all-payments" element={<AllPayments />} />
                <Route
                  path="admin/all-orders/order-timeline"
                  element={<AdminOrderTimeline />}
                />
              </>
            ) : user && user.role_id === 3 ? ( // Agent Routes
              <>
                <Route
                  path="agent/all-orders"
                  element={<AgentOrders user={user} />}
                />
                 <Route
                  path="agent/all-orders/order-timeline"
                  element={<AgentOrderTimeline />}
                />
              </>
            ) : (
              <Route path="orders" element={<MyOrders orders={orders} />} />
            )}
          </Routes>
        )}
      </main>
    </div>
  );
};

export default Profile;
