import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faSignOutAlt,
  faBars,
  faTimes,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

import { navLinks } from "../../constants";
import { Link } from "react-router-dom"; // Import Link
import { useCart } from "../../context/CartContext";

const NavMobile = ({
  username,
  roleid,
  logout,
  menuOpen,
  toggleMenu,
}) => {
  const { cart } = useCart();

  return (
    <>
      <header className="fixed py-4 top-0 left-0 w-full bg-sky-950  text-white font-semibold z-50 md:hidden">
        {/* Your mobile navigation content here */}
        <div className="flex justify-between items-center p-4">
          <button className="flex items-center" onClick={toggleMenu}>
            <FontAwesomeIcon
              icon={menuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>
          <div className="relative flex items-center space-x-4 ml-auto  mr-8">
            {username ? (
              <div className="flex items-center gap-4">
                <p className="font-palanquin text-xl leading-3">
                  <Link
                    to="/profile"
                    className="flex items-end group font-palanquin text-lg md:text-xl leading-3 hover:text-cyan-400"
                  >
                    Welcome, {username}!
                  </Link>
                </p>
                <Link className="flex items-end group" onClick={logout}>
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-xl mr-2 hover:text-sky-700 hover:underline hover:cursor-pointer"
                  />
                  <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
                    Logout
                  </span>
                </Link>
                <Link to="/cart" className="flex items-end group relative">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-xl hover:text-cyan-600 cursor-pointer"
                  />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-end group">
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="text-2xl hover:text-cyan-600 hover:underline cursor-pointer"
                  />
                  <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
                    Profile
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="flex items-center group relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-xl hover:text-sky-700 hover:underline hover:cursor-pointer"
                />
                <span className="hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Login
                </span>
              </Link>
            )}

          </div>
        </div>
      </header>

      <nav
        className={`fixed top-20 left-0 w-full bg-sky-950 text-white z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-screen" : "max-h-0"
        }`}
        style={{ maxHeight: menuOpen ? "calc(100vh - 64px)" : "0" }} // Adjust height based on the content
      >
        <ul className="flex flex-col items-center mt-3 mb-2">
          {navLinks.map((item) => (
            (item.label !== "Products" || username) && (
              <li
                key={item.label}
                className="w-full text-center border-gray-200 border-b"
              >
                <Link
                  to={item.href}
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === item.href ? "text-sky-400" : ""
                  }`}
                  onClick={() => toggleMenu()}
                >
                  {item.label}
                </Link>
              </li>
            )
          ))}

          {roleid == 1 ? ( // Check if user exists and role_id is 1
            <>
              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/all-orders"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/all-orders"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  All Orders
                </Link>
              </li>
              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/order-status"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/order-status"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  Order Status
                </Link>
              </li>
              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/all-products"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/all-products"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  All Products
                </Link>
              </li>
              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/all-users"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/all-users"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  All Users
                </Link>
              </li>

              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/all-categories"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/all-categories"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  All Categories
                </Link>
              </li>
              <li className="w-full text-center border-gray-200 border-b">
                <Link
                  to="/profile/admin/all-companies"
                  className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                    location.pathname === "/profile/admin/all-companies"
                      ? "text-sky-400"
                      : ""
                  }`}
                >
                  All Company
                </Link>
              </li>


            </>

          ) : (
            <li className="w-full text-center border-gray-200 border-b">
              <Link
                to="/profile/orders"
                className={`block py-3 text-xl text-white hover:text-cyan-400 underline-animation ${
                  location.pathname === "/profile/orders" ? "text-sky-400" : ""
                }`}
              >
                My Orders
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default NavMobile;
