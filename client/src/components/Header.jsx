import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { TfiBook } from "react-icons/tfi";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (currentUser?.role === "admin") return null;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300 font-sans">

      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="min-md:ml-4 bg-transparent border-0 flex gap-1 items-center max-md:text-base max-md:pr-3 max-md:pl-1 rounded-lg font-extrabold text-2xl"
        >
          <TfiBook className="text-green-600" /> {/* Light green icon */}
          <span className="text-green-600">Ink</span> {/* Light green text */}
          <span className="text-blue-600 font-extrabold">Circle</span>{" "}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
        
          <Link
            to="/"
            className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
           Browse
          </Link>
          <Link
            to="/about"
            className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
            About
          </Link>
          
          {currentUser ? (
            <Link to="/profile">
              <div className="flex items-center space-x-2 bg-white px-4 py-1 rounded-full shadow hover:shadow-md transition-all">
                <span className="text-gray-700 font-medium">
                  {currentUser.name || "Profile"}
                </span>
                <img
                  src={currentUser.avatar}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover border-2 border-blue-500"
                />
              </div>
            </Link>
          ) : (
            <Link to="/profile">
              <div className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition">
                Sign In
              </div>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {currentUser && (
            <Link to="/profile">
              <img
                className="h-8 w-8 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                src={currentUser.avatar}
                alt="profile"
              />
            </Link>
          )}
          <button
            onClick={toggleMenu}
            className="text-cyan-700 focus:outline-none hover:text-blue-700 transition"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg mt-2 transition-all">
          <nav className="flex flex-col text-center space-y-2 py-4">
            
          

            <Link
              to="/"
              onClick={toggleMenu}
              className="text-gray-700 text-lg font-medium hover:text-teal-700"
            >
              Home
            </Link>
            <Link
            to="/browse"
            className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
          >
           Browse
          </Link>
            <Link
              to="/about"
              onClick={toggleMenu}
              className="text-gray-700 font-medium hover:bg-slate-50 py-2 rounded"
            >
              About
            </Link>
            {!currentUser && (
              <Link
                to="/profile"
                onClick={toggleMenu}
                
                className="bg-blue-600 text-white font-semibold mx-10 py-2 rounded-full hover:bg-blue-600 transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
