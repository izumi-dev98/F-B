import { useEffect, useState } from "react";
import supabase from "../createClients";
import Swal from "sweetalert2";

export default function History() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const ordersPerPage = 8;

  const mmkFormatter = new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0,
  });

  // Fetch all orders, items, and menu
  const fetchHistory = async () => {
    try {
      const { data: orders, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (ordersErr) throw ordersErr;

      const { data: orderItems, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .order("id", { ascending: true });
      if (itemsErr) throw itemsErr;

      const { data: menuData, error: menuErr } = await supabase
        .from("menu")
        .select("*");
      if (menuErr) throw menuErr;

      // Merge menu names
      const historyData = orders.map((order) => {
        const items = orderItems
          .filter((i) => i.order_id === order.id)
          .map((i) => ({
            ...i,
            menu_name: menuData.find((m) => m.id === i.menu_id)?.menu_name || "Unknown Menu",
          }));
        return { ...order, items };
      });

      setHistory(historyData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to fetch history", "error");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filtered history based on search
  const filteredHistory = history.filter((order) => {
    const searchLower = search.toLowerCase();
    const matchOrderId = order.id.toString().includes(searchLower);
    const matchMenuItem = order.items.some((item) =>
      item.menu_name.toLowerCase().includes(searchLower)
    );
    return matchOrderId || matchMenuItem;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / ordersPerPage);
  const paginatedHistory = filteredHistory.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  // Print receipt
  const printReceipt = (order) => {
    const date = new Date(order.created_at).toLocaleString();
    const receiptContent = `
      <html>
        <head><title>Order #${order.id}</title></head>
        <body style="font-family: monospace; width: 300px; padding: 10px;">
          <h1 style="text-align:center;">MMK Restaurant</h1>
          <p>Order ID: ${order.id}</p>
          <p>Date: ${date}</p>
          <table style="width:100%; border-collapse: collapse;">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${order.items.map(i => `<tr>
                <td>${i.menu_name}</td>
                <td>${i.qty}</td>
                <td>${mmkFormatter.format(i.price)}</td>
                <td>${mmkFormatter.format(i.price * i.qty)}</td>
              </tr>`).join("")}
            </tbody>
            <tfoot><tr><td colspan="3">Total</td><td>${mmkFormatter.format(order.total)}</td></tr></tfoot>
          </table>
          <p style="text-align:center;">Thank you!</p>
        </body>
      </html>
    `;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(receiptContent);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Order History</h1>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by Order ID or Item Name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">No orders found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedHistory.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">Order #{order.id}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}<br/>
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <ul className="border-t border-b py-2 text-sm max-h-48 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between py-1 border-b last:border-b-0">
                        <span>{item.menu_name} × {item.qty}</span>
                        <span>{mmkFormatter.format(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">Total: {mmkFormatter.format(order.total)}</span>
                  <button
                    onClick={() => printReceipt(order)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-xl hover:bg-blue-700 transition"
                  >
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              disabled={page === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition ${
                  page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
