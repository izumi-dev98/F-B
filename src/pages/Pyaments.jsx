import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import supabase from "../createClients";

export default function Pyaments({ inventory, setInventory }) {
  const [menu, setMenu] = useState([]);
  const [ingredientsMap, setIngredientsMap] = useState({});
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const mmkFormatter = new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    maximumFractionDigits: 0,
  });

  // Fetch menu and ingredients
  const fetchMenu = async () => {
    try {
      const { data: menuData, error: menuErr } = await supabase.from("menu").select("*");
      if (menuErr) throw menuErr;

      const { data: ingData, error: ingErr } = await supabase.from("menu_ingredients").select("*");
      if (ingErr) throw ingErr;

      const map = {};
      ingData.forEach((ing) => {
        if (!map[ing.menu_id]) map[ing.menu_id] = [];
        map[ing.menu_id].push(ing);
      });
      setIngredientsMap(map);

      const merged = menuData.map((m) => ({
        ...m,
        ingredients: map[m.id] || [],
      }));
      setMenu(merged);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load menu", "error");
      setMenu([]);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredMenu = useMemo(
    () =>
      menu.filter((m) =>
        (m.menu_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [menu, search]
  );

  const addToCart = (item) => {
    const ingredients = ingredientsMap[item.id] || [];
    let maxQty = Infinity;

    for (const ing of ingredients) {
      const inv = safeInventory.find((i) => i.id === ing.inventory_id);
      const stock = inv ? Math.floor(inv.qty / ing.qty) : 0;
      if (stock === 0)
        return Swal.fire("Out of Stock", `${item.menu_name} cannot be added`, "error");
      if (stock < maxQty) maxQty = stock;
    }

    setCart((prev) => {
      const exist = prev.find((c) => c.id === item.id);
      if (exist) {
        if (exist.qty >= maxQty) {
          Swal.fire("Stock Limit", `Cannot add more ${item.menu_name}`, "warning");
          return prev;
        }
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (id, diff) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const newQty = c.qty + diff;
            if (newQty <= 0) return null;

            const ingredients = ingredientsMap[c.id] || [];
            if (!ingredients.length) return { ...c, qty: newQty };

            const maxQty = Math.min(
              ...ingredients.map((ing) => {
                const inv = safeInventory.find((i) => i.id === ing.inventory_id);
                return inv ? Math.floor(inv.qty / ing.qty) : 0;
              })
            );

            if (newQty > maxQty) {
              Swal.fire("Stock Limit", `Cannot add more ${c.menu_name}`, "warning");
              return c;
            }
            return { ...c, qty: newQty };
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const completeOrder = async () => {
    if (!cart.length) return Swal.fire("Cart Empty", "Add items first", "warning");

    try {
      const updatedInventory = safeInventory.map((i) => ({ ...i }));

      // Check inventory
      for (const item of cart) {
        const ingredients = ingredientsMap[item.id] || [];
        for (const ing of ingredients) {
          const inv = updatedInventory.find((i) => i.id === ing.inventory_id);
          if (!inv || inv.qty < ing.qty * item.qty) {
            throw new Error(`Not enough ${inv?.item_name || "Unknown"} for ${item.menu_name}`);
          }
        }
      }

      // Insert order
      const { data: order, error: orderErr } = await supabase.from("orders").insert([{ total }]).select().single();
      if (orderErr) throw orderErr;

      // Insert order items and update inventory
      for (const item of cart) {
        await supabase.from("order_items").insert({
          order_id: order.id,
          menu_id: item.id,
          qty: item.qty,
          price: item.price,
        });

        const ingredients = ingredientsMap[item.id] || [];
        for (const ing of ingredients) {
          const inv = updatedInventory.find((i) => i.id === ing.inventory_id);
          const newQty = inv.qty - ing.qty * item.qty;
          const { error: invErr } = await supabase.from("inventory").update({ qty: newQty }).eq("id", ing.inventory_id);
          if (invErr) throw invErr;
          inv.qty = newQty;
        }
      }

      setInventory(updatedInventory);

      // Print receipt
      const date = new Date().toLocaleString();
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
                ${cart.map(i => `<tr>
                  <td>${i.menu_name}</td>
                  <td>${i.qty}</td>
                  <td>${mmkFormatter.format(i.price)}</td>
                  <td>${mmkFormatter.format(i.price * i.qty)}</td>
                </tr>`).join("")}
              </tbody>
              <tfoot><tr><td colspan="3">Total</td><td>${mmkFormatter.format(total)}</td></tr></tfoot>
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

      setCart([]);
      Swal.fire("Success", "Order completed!", "success");
      fetchMenu();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to complete order", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Menu */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-3xl font-bold mb-5">Menu</h2>
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-6 border rounded-xl"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="border rounded-2xl p-4 text-left hover:shadow"
            >
              <p className="font-semibold">{item.menu_name}</p>
              <p className="text-sm text-gray-500">{mmkFormatter.format(item.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-3xl font-bold mb-5">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border rounded-xl p-4 mb-3">
              <div>
                <p className="font-semibold">{item.menu_name}</p>
                <p className="text-sm">{mmkFormatter.format(item.price)} × {item.qty}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => changeQty(item.id, -1)}>−</button>
                <button onClick={() => changeQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))
        )}
        <div className="mt-6 border-t pt-4 flex justify-between font-bold text-xl">
          <span>Total</span>
          <span>{mmkFormatter.format(total)}</span>
        </div>
        <button onClick={completeOrder} className="w-full mt-4 bg-green-600 text-white py-3 rounded-2xl">
          Complete & Print Order
        </button>
      </div>
    </div>
  );
}
