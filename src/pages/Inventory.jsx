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
  const itemsPerPage = 6

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openAddModal = () => {
    setFormData({ item_name: "", qty: "", type: "" })
    setIsEditing(false)
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setFormData({
      item_name: item.item_name,
      qty: item.qty,
      type: item.type
    })
    setEditId(item.id)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isEditing) {
      await updateInventoryItem(editId, {
        item_name: formData.item_name,
        qty: Number(formData.qty),
        type: formData.type
      })
    } else {
      await addInventoryItem({
        item_name: formData.item_name,
        qty: Number(formData.qty),
        type: formData.type
      })
    }
    setShowModal(false)
    setIsEditing(false)
    setEditId(null)
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl">Inventory</h2>

        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search Inventory..."
            className="p-2 border rounded w-60"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // reset page on search
            }}
          />

          <button onClick={openAddModal} className="p-2 bg-green-500 text-white rounded">
            ADD
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="border w-full text-center">
        <thead>
          <tr>
            <th className="border p-2">No</th>
            <th className="border p-2">Item Name</th>
            <th className="border p-2">QTY</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedInventory.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4">No inventory found</td>
            </tr>
          ) : (
            paginatedInventory.map((item, index) => (
              <tr key={item.id}>
                <td className="border p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="border p-2">{item.item_name}</td>
                <td className="border p-2">{item.qty}</td>
                <td className="border p-2">{item.type}</td>
                <td className="border p-2 flex justify-center gap-3">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-gray-300 rounded"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 bg-gray-300 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Inventory" : "Add Inventory"}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="item_name"
                placeholder="Item Name"
                value={formData.item_name}
                onChange={(e) => handleChange(e)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="qty"
                placeholder="Quantity"
                value={formData.qty}
                onChange={(e) => handleChange(e)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={(e) => handleChange(e)}
                className="w-full p-2 border rounded"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
