import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Swal from "sweetalert2"
import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Payments from "./pages/Pyaments"
import History from "./pages/History"
import Menu from "./pages/Menu"
import Inventory from "./pages/Inventory"
import supabase from "./createClients"

export default function App() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768)
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("id", { ascending: true })

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Fetch failed",
          text: error.message
        })
      } else {
        setInventory(data)
      }
    }
    fetchInventory()
  }, [])

  const addInventoryItem = async (item) => {
    const { data, error } = await supabase
      .from("inventory")
      .insert([item])
      .select()
      .single()

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Add failed",
        text: error.message
      })
    } else {
      setInventory(prev => [...prev, data])
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Inventory item added."
      })
    }
  }

  const updateInventoryItem = async (id, updatedItem) => {
    const { data, error } = await supabase
      .from("inventory")
      .update(updatedItem)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: error.message
      })
    } else {
      setInventory(prev => prev.map(item => (item.id === id ? data : item)))
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Inventory item updated."
      })
    }
  }

  const deleteInventoryItem = async (id) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    })

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id)

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: error.message
        })
      } else {
        setInventory(prev => prev.filter(item => item.id !== id))
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Item removed."
        })
      }
    }
  }

  const toggleSidebar = () => setIsOpen(prev => !prev)

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 min-h-screen bg-gray-100 ${isOpen ? "ml-64" : "ml-0"}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/history" element={<History />} />
            <Route path="/menu" element={<Menu />} />
            <Route
              path="/inventory"
              element={
                <Inventory
                  inventory={inventory}
                  addInventoryItem={addInventoryItem}
                  updateInventoryItem={updateInventoryItem}
                  deleteInventoryItem={deleteInventoryItem}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}
