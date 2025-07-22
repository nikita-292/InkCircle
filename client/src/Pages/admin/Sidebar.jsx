// src/components/admin/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Users,
  FileText,
  BarChart2,
  CheckSquare,
  BookAIcon,
  X,
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigation = [
    { name: "Dashboard", href: "/admin-dashboard", icon: BarChart2 },
    { name: "Users", href: "/admin-dashboard/users", icon: Users },
    { name: "Books", href: "/admin-dashboard/books", icon: FileText },
    {
      name: "Pending Approvals",
      href: "/admin-dashboard/pending",
      icon: CheckSquare,
    },
    { name: "Authors", href: "/admin-dashboard/authors", icon: BookAIcon },
  ];

  const linkStyle = ({ isActive }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-blue-100 text-blue-800 font-semibold shadow"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-800"
    }`;

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-[#f0f4f8] shadow-lg rounded-r-xl flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/admin-dashboard"} // ✅ Only Dashboard gets `end`
                  className={linkStyle}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-1 min-h-0 bg-[#f0f4f8] border-r border-gray-300 shadow-md rounded-tr-xl rounded-br-xl">
            <div className="flex items-center h-16 px-4 border-b border-gray-300">
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-3 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === "/admin-dashboard"} // ✅ Only Dashboard gets `end`
                    className={linkStyle}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
