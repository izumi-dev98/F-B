import { useState } from "react";
import { NavLink } from "react-router-dom";

const accessRights = {
  superadmin: ["dashboard", "payments", "history", "menu", "inventory", "report", "user-create"],
  admin: ["dashboard", "history", "inventory", "report"],
  chief: ["dashboard", "payments", "history", "report", "menu"],
  user: ["dashboard", "payments", "history", "report"],
};

export default function Sidebar({ isOpen }) {
  const [reportOpen, setReportOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const roleAccess = user ? accessRights[user.role] : [];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-60 bg-white text-black transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-3 py-4 px-6 border-b border-gray-300">
        <span className="font-bold text-lg">POS System</span>
      </div>

      <nav className="p-4 space-y-3">
        {roleAccess.includes("dashboard") && (
          <NavLink
            to="/dashboard"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            Dashboard
          </NavLink>
        )}
        {roleAccess.includes("payments") && (
          <NavLink
            to="/payments"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            Payments
          </NavLink>
        )}
        {roleAccess.includes("history") && (
          <NavLink
            to="/history"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            History
          </NavLink>
        )}
        {roleAccess.includes("menu") && (
          <NavLink
            to="/menu"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            Menu
          </NavLink>
        )}
        {roleAccess.includes("inventory") && (
          <NavLink
            to="/inventory"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            Inventory
          </NavLink>
        )}
        {roleAccess.includes("report") && (
          <div>
            <button
              onClick={() => setReportOpen(!reportOpen)}
              className="w-full text-left hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
            >
              Reports
            </button>
            {reportOpen && (
              <div className="mt-2 ml-4 space-y-2">
                <NavLink
                  to="/reports/inventory"
                  className="block hover:text-blue-400 border border-gray-300 px-4 py-2 rounded-lg text-sm"
                >
                  Inventory Report
                </NavLink>
                <NavLink
                  to="/reports/total-sales"
                  className="block hover:text-blue-400 border border-gray-300 px-4 py-2 rounded-lg text-sm"
                >
                  Total Sale Report
                </NavLink>
              </div>
            )}
          </div>
        )}
        {roleAccess.includes("user-create") && (
          <NavLink
            to="/user-create"
            className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg"
          >
            Create User
          </NavLink>
        )}
        <NavLink
          to="/logout"
          className="block hover:text-red-500 border border-gray-500 px-4 py-2 rounded-lg"
        >
          Logout
        </NavLink>
      </nav>
    </aside>
  );
}
