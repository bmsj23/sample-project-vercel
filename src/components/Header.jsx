import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useContexts";

function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isUserAuthenticated = isAuthenticated();

  return (
    <header className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* logo */}
          <div className="flex items-center space-x-2">
            <img src="/assets/images/faviconheader.ico" className="w-10 h-10" alt="logo" />
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 mb-1">
              StudySpot PH
            </Link>
          </div>

          {/* navigation */}
          <nav className="
          md:flex justify-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium ${
                location.pathname === "/"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-900 hover:text-blue-600"
              }`}>
              Browse Spaces
            </Link>

            {isUserAuthenticated && (
              <Link
                to="/dashboard/my-bookings"
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === "/dashboard/my-bookings"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-900 hover:text-blue-600"
                }`}>
                My Bookings
              </Link>
            )}
          </nav>

          {/* auth section (right) */}
          <div className="flex items-center justify-end space-x-4">
            {isUserAuthenticated ? (
              <>
                <span className="text-gray-700">Welcome, {user?.username}!</span>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 hover:cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                state={{ from: location }}
                replace
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* mobile nav */}
      <div className="md:hidden">
        <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
          <Link
            to="/"
            className={`block px-3 py-2 text-base font-medium ${
              location.pathname === "/"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            }`}>
            Browse Spaces
          </Link>

          {isUserAuthenticated && (
            <Link
              to="/dashboard/my-bookings"
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === "/dashboard/my-bookings"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-900 hover:text-blue-600 hover:bg-gray-50"
              }`}>
              My Bookings
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
