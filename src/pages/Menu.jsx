import { useState } from "react";
import Swal from "sweetalert2";

export default function Menu({ inventory, menu, addMenuItem, updateMenuItem, deleteMenuItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    menu_name: "",
    price: "",
    image: null,
    items: [{ item_name: "", qty: "" }],
  });

  const filteredMenu = menu.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const paginatedMenu = filteredMenu.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleItemChange = (i, e) => {
    const updated = [...formData.items];
    updated[i][e.target.name] = e.target.value;
    setFormData({ ...formData, items: updated });
  };

  const addItemRow = () => setFormData({ ...formData, items: [...formData.items, { item_name: "", qty: "" }] });
  const removeItemRow = (i) => setFormData({ ...formData, items: formData.items.filter((_, index) => index !== i) });

  const openAddModal = () => {
    setFormData({ menu_name: "", price: "", image: null, items: [{ item_name: "", qty: "" }] });
    setImagePreview(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      menu_name: item.name,
      price: item.price,
      image: null,
      items: item.items || [{ item_name: "", qty: "" }],
    });
    setImagePreview(item.image || null);
    setEditId(item.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.menu_name,
      price: Number(formData.price),
      items: formData.items,
      image: imagePreview,
    };
    try {
      if (isEditing) await updateMenuItem(editId, payload);
      else await addMenuItem(payload);
      setShowModal(false);
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold">🍽️ Menu</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search menu..."
            className="px-4 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={openAddModal}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md transition"
          >
            + Add Menu
          </button>
        </div>
      </div>
      {/* Modern Menu Cards - UI Improved */}
      {paginatedMenu.length === 0 ? (
        <p className="text-center text-gray-400 mt-12 text-lg">
          No menu items found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 overflow-hidden group"
            >
              {/* Image Section */}
              <div className="relative h-52 overflow-hidden rounded-t-3xl">
                <img
                  src={item.image || "https://via.placeholder.com/300x180"}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Price Badge with Gradient Overlay */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm px-4 py-1 rounded-full shadow-md">
                  {item.price} MMK
                </div>
                {/* Optional overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-4">
                <h3 className="text-gray-900 font-bold text-xl truncate">{item.name}</h3>

                {/* Ingredients Section */}
                {item.items && item.items.length > 0 && (
                  <>
                    <h4 className="text-gray-500 text-sm font-medium">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.items.map((ing, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-200 transition"
                        >
                          {ing.item_name} <span className="font-medium">({ing.qty})</span> <span className="text-gray-400">{ing.type}</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-4 py-1 rounded-lg ${currentPage === p ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{isEditing ? "Edit Menu" : "Add Menu"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Menu Name</label>
                <input
                  name="menu_name"
                  placeholder="Enter menu name"
                  value={formData.menu_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Price (MMK)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Menu Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                {imagePreview && <img src={imagePreview} className="mt-3 w-full h-40 object-cover rounded-2xl" />}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Ingredients</p>
                {formData.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      name="item_name"
                      placeholder="Ingredient"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(i, e)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <input
                      name="type"
                      placeholder="Type"
                      value={item.type}
                      onChange={(e) => handleItemChange(i, e)}
                      className="flex-1 w-30 px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    <input
                      type="number"
                      name="qty"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItemRow(i)} className="text-red-500 font-bold">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="text-blue-600 text-sm hover:underline">
                  + Add Ingredient
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
