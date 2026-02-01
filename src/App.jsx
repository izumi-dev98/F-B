// App.jsx
import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Payments from "./pages/Pyaments"
import History from "./pages/History"
import Menu from "./pages/Menu"
import Inventory from "./pages/Inventory"

export default function App() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768)

  // Auto show/hide on resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => setIsOpen(prev => !prev)

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`
          flex-1 min-h-screen bg-gray-100 transition-all duration-300
          ${isOpen ? "ml-64" : "ml-0"}
        `}
      >
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/history" element={<History />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
