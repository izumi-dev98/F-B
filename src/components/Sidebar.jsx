import { NavLink } from "react-router-dom";

// components/Sidebar.jsx
export default function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                    <button
                        onClick={toggleSidebar}
                        className="text-2xl"
                    >
                        ☰
                    </button>
                    <span className="font-bold text-lg">ATY F&B </span>
                </div>

                <nav className="p-4 space-y-3">
                    <NavLink to='/' className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">Dashboard</NavLink>
                    <NavLink to='/payments' className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">Payments</NavLink>
                    <NavLink to='/history' className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">History</NavLink>
                    <NavLink to='/menu' className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">Menu</NavLink>
                    <NavLink to='/inventory' className="block hover:text-blue-400 border border-gray-500 px-4 py-2 rounded-lg">Inventory</NavLink>
                    <a className="block absolute bottom-10 hover:text-red-400 border border-gray-500 px-4 py-2 rounded-lg w-55" href="#">Log Out</a>
                </nav>
            </aside>
        </>
    )
}
