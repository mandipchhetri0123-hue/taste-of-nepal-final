"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";

type FoodStockItem = {
  id: string;
  name: string;
  stock: number;
};

export default function StockPage() {
  const [items, setItems] = useState<FoodStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStock = async () => {
    try {
      const res = await fetch("/api/admin/stock/list");
      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else {
        setItems(json.items);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStock();
  }, []);

  const handleSave = async (id: string, newStock: number) => {
    setSavingId(id);
    setError(null);

    try {
      const res = await fetch("/api/admin/stock/update", {
        method: "POST",
        body: JSON.stringify({ id, stock: newStock }),
      });

      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else {
        alert("Stock updated!");
        loadStock();
      }
    } catch (e: any) {
      setError(e.message);
    }

    setSavingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete stock entry for "${name}"?`)) return;
    setSavingId(id);
    setError(null);

    try {
      const res = await fetch("/api/admin/stock/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else {
        alert("Stock deleted!");
        loadStock();
      }
    } catch (e: any) {
      setError(e.message);
    }

    setSavingId(null);
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="p-10">Loading global stock…</div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-4">Manage Global Stock</h1>
        <p className="mb-4 text-gray-600">
          Each dish here is shared across all packages. Editing stock will update
          Standard, Premium, and Deluxe together.
        </p>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Dish</th>
                <th className="px-3 py-2 border">Current Stock</th>
                <th className="px-3 py-2 border">New Stock</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                    No dishes found in foodStock.
                  </td>
                </tr>
              )}

              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 border">{item.name}</td>

                  <td className="px-3 py-2 border">{item.stock}</td>

                  <td className="px-3 py-2 border">
                    <input
                      type="number"
                      min={0}
                      value={item.stock}
                      className="w-24 p-1 border rounded"
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, stock: Number(e.target.value) }
                              : i
                          )
                        )
                      }
                    />
                  </td>

                  <td className="px-3 py-2 border">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-400 mr-2"
                      disabled={savingId === item.id}
                      onClick={() => handleSave(item.id, item.stock)}
                    >
                      {savingId === item.id ? "Saving…" : "Save"}
                    </button>

                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
                      disabled={savingId === item.id}
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminRoute>
  );
}
