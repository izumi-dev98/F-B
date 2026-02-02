import { useState } from "react"

export default function Inventory({
  inventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [formData, setFormData] = useState({
    item_name: "",
    qty: "",
    type: ""
  })

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const openAddModal = () => {
    setFormData({ item_name: "", qty: "", type: "" })
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setFormData(item)
    setEditId(item.id)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      item_name: formData.item_name,
      qty: Number(formData.qty),
      type: formData.type
    }

    isEditing
      ? await updateInventoryItem(editId, payload)
      : await addInventoryItem(payload)

    setShowModal(false)
    setIsEditing(false)
    setEditId(null)
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">📦 Inventory</h2>

        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search items..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />

          <button
            onClick={openAddModal}
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedInventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No inventory found
                </td>
              </tr>
            ) : (
              paginatedInventory.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-3 font-medium">{item.item_name}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-full ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Item" : "Add Item"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="item_name"
                placeholder="Item name"
                value={formData.item_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                name="qty"
                placeholder="Quantity"
                value={formData.qty}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
