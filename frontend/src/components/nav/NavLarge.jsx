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

const NavLarge = ({ location, username, logout }) => {

  return (
    <ul className="hidden md:flex flex-1 justify-center items-center gap-8">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src="/logo.jpg" // Replace with your logo path
          alt="Company Logo"
          className="h-20 ml-28 -mt-4 -mb-4"
        />
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 flex justify-center items-center md:gap-8 lg:gap-16">
        {navLinks.map((item) => (
          (item.label !== "Products" || username) && (
            <li key={item.label}>
              <Link
                to={item.href}
                className={`block py-4 font-palanquin text-xl text-start text-white hover:text-cyan-400 underline-animation ${
                  location.pathname === item.href ? "text-sky-400" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        ))}
      </div>

      {/* Sign In, Logout, and Cart (Desktop View) */}
      <li className="flex items-center gap-4 relative ml-auto">
        <div className="relative">
          {username ? (
            <div className="flex items-center gap-4">
              <p className="flex items-end group font-palanquin text-xl leading-3">
                Welcome, {username}!
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
            <Link to="/login" className="flex items-end group">
              <FontAwesomeIcon
                icon={faUser}
                className="text-xl mr-2 hover:text-sky-700 hover:underline hover:cursor-pointer"
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
