import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Menu, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  signOutUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from "../../redux/user/userSlice";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [adminInfo, setAdminInfo] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const dropdownRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setAdminInfo(user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signout`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      localStorage.removeItem("user");
      dispatch(deleteUserSuccess(data));
      navigate("/signin");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-md">
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Left section */}
      <div className="flex items-center">
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200"
          onClick={() => setSidebarOpen(true)}
          title="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-3 tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition duration-200"
          title="Notifications"
        >
          <Bell className="h-6 w-6" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 focus:outline-none group"
          >
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:ring-2 ring-indigo-400 transition duration-200">
              <User className="h-5 w-5" />
            </div>
            <span className="text-sm text-gray-700 hidden sm:block font-medium">
              {adminInfo.username || "Admin"}
            </span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fadeIn">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</header>

  );
};

export default Header;
