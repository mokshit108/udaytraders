import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faSignOutAlt,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { navLinks } from "../../constants";

import { Link } from "react-router-dom"; // Import Link
import { useCart } from "../../context/CartContext";

const NavLarge = ({ location, username, logout }) => {
  const { cart } = useCart();

  return (
    <ul className="hidden md:flex items-center justify-between w-full px-6 lg:px-12 py-4">
      {/* Logo */}
      <li>
        <Link to="/" className="flex items-center">
          <img
            src="/logo.jpg"
            alt="Company Logo"
            className="h-16 lg:h-20"
          />
        </Link>
      </li>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 lg:gap-12">
        {navLinks.map((item) => (
          <li key={item.label}>
            <Link
              to={item.href}
              className={`block py-4 font-palanquin text-lg xl:text-xl text-start transition-colors ${
                location.pathname === item.href 
                  ? "text-cyan-400 underline underline-offset-8 decoration-2 decoration-cyan-400" 
                  : "text-white hover:text-cyan-400 underline-animation"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </div>

      {/* Sign In, Logout, and Cart (Desktop View) */}
      <li className="flex items-center gap-4 relative">
        <div className="relative">
          {username ? (
            <div className="flex items-center gap-4">
              <p className="flex items-end group font-palanquin text-lg xl:text-xl leading-3">
                Welcome, {username}!
              </p>
              <Link className="flex items-end group" onClick={logout}>
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  className="text-lg xl:text-xl hover:text-sky-700 hover:underline hover:cursor-pointer"
                />
                <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
                  Logout
                </span>
              </Link>
              <Link to="/cart" className="flex items-end group relative">
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-lg xl:text-xl hover:text-cyan-600 hover:underline cursor-pointer"
                />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
                <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
                  Cart
                </span>
              </Link>
              <Link to="/profile" className="flex items-end group">
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="text-xl xl:text-2xl hover:text-cyan-600 hover:underline cursor-pointer"
                />
                <span className="ml-4 hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 transform -translate-x-1/2 whitespace-nowrap">
                  Profile
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="flex items-end group">
              <FontAwesomeIcon
                icon={faUser}
                className="text-lg xl:text-xl hover:text-sky-700 hover:underline hover:cursor-pointer"
              />
              <span className="hidden group-hover:block bg-sky-700 text-white text-xs px-3 py-1 rounded absolute -top-8 left-full transform -translate-x-1/2 whitespace-nowrap">
                Login
              </span>
            </Link>
          )}
        </div>
      </li>
    </ul>
  );
};

export default NavLarge;
