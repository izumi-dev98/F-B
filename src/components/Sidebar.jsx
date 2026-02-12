import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ isOpen }) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen w-60 bg-white text-black
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center gap-3 py-4 px-6 border-b border-gray-300">
        <span className="font-bold text-lg">POS System</span>
      </div>

      <nav className="p-4 space-y-3">
        <NavLink to="/" className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">
          Dashboard
        </NavLink>

        <NavLink to="/payments" className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">
          Payments
        </NavLink>

        <NavLink to="/history" className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">
          History
        </NavLink>

        <NavLink to="/menu" className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">
          Menu
        </NavLink>

        <NavLink to="/inventory" className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">
          Inventory
        </NavLink>

        {/* Reports Dropdown */}
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
      </nav>
    </aside>
  );
}
