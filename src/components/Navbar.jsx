// components/Navbar.jsx
export default function Navbar({ toggleSidebar }) {
  return (
    <header className="flex items-center py-4 px-4 bg-white shadow">
      <button
        onClick={toggleSidebar}
        className="text-2xl"
      >
        ☰
      </button>
      <h1 className="ml-4 font-semibold"> POS System</h1>
    </header>
  )
}
