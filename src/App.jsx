import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Pyaments"; // fixed typo
import History from "./pages/History";
import Menu from "./pages/Menu";
import Inventory from "./pages/Inventory";

import supabase from "./createClients";
import Pyaments from "./pages/Pyaments";
import InventoryReport from "./pages/InventoryReport";
import TotalSalesReport from "./pages/TotalSalesReport";

export default function App() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [inventory, setInventory] = useState([]);
  const [menu, setMenu] = useState([]);

  // ------------------- Responsive Sidebar -------------------
  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ------------------- Inventory -------------------
  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("id", { ascending: true });

    if (error) Swal.fire("Error", error.message, "error");
    else setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addInventoryItem = async (item) => {
    const { data, error } = await supabase
      .from("inventory")
      .insert([item])
      .select()
      .single();
    if (error) Swal.fire("Error", error.message, "error");
    else {
      setInventory((prev) => [...prev, data]);
      Swal.fire("Success", "Inventory added", "success");
    }
  };

  const updateInventoryItem = async (id, updatedItem) => {
    const { data, error } = await supabase
      .from("inventory")
      .update(updatedItem)
      .eq("id", id)
      .select()
      .single();
    if (error) Swal.fire("Error", error.message, "error");
    else {
      setInventory((prev) => prev.map((item) => (item.id === id ? data : item)));
      Swal.fire("Success", "Inventory updated", "success");
    }
  };

  const deleteInventoryItem = async (id) => {
    const result = await Swal.fire({
      title: "Delete Inventory?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        setInventory((prev) => prev.filter((i) => i.id !== id));
        Swal.fire("Deleted", "Inventory removed", "success");
      }
    }
  };

  // ------------------- Menu -------------------
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("id", { ascending: true });

    if (error) Swal.fire("Error", error.message, "error");
    else setMenu(data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addMenuItem = async (item) => {
    const { data, error } = await supabase
      .from("menu")
      .insert([item])
      .select()
      .single();
    if (error) Swal.fire("Error", error.message, "error");
    else {
      setMenu((prev) => [...prev, data]);
      Swal.fire("Success", "Menu added", "success");
    }
  };

  const updateMenuItem = async (id, updatedItem) => {
    const { data, error } = await supabase
      .from("menu")
      .update(updatedItem)
      .eq("id", id)
      .select()
      .single();
    if (error) Swal.fire("Error", error.message, "error");
    else {
      setMenu((prev) => prev.map((m) => (m.id === id ? data : m)));
      Swal.fire("Updated", "Menu updated", "success");
    }
  };

  const deleteMenuItem = async (id) => {
    const result = await Swal.fire({
      title: "Delete Menu?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from("menu").delete().eq("id", id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        setMenu((prev) => prev.filter((m) => m.id !== id));
        Swal.fire("Deleted", "Menu deleted", "success");
      }
    }
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 min-h-screen bg-gray-100 ${isOpen ? "ml-60" : "ml-0"}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/payments"
              element={
                <Pyaments
                  inventory={inventory}
                  setInventory={setInventory}
                  menu={menu}
                />
              }
            />
            <Route path="/history" element={<History />} />
            <Route
              path="/menu"
              element={
                <Menu
                  menu={menu}
                  inventory={inventory}
                  addMenuItem={addMenuItem}
                  updateMenuItem={updateMenuItem}
                  deleteMenuItem={deleteMenuItem}
                />
              }
            />
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
            <Route path="/reports/inventory" element={<InventoryReport/>} />
             <Route path="/reports/total-sales" element={<TotalSalesReport/>} />
                  
          </Routes>
        </main>
      </div>
    </div>
  );
}
