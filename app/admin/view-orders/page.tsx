'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/AdminRoute';

type OrderDoc = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  totalAmount: number;
  items: any[];
};

export default function ViewOrders() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders as OrderDoc[]);
        } else {
          console.error("Orders fetch failed:", data.error);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) return <p className="p-10">Loading orders...</p>;

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Customer Orders</h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <div key={o.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-1">
                  {o.fullName} — ${o.totalAmount?.toFixed(2)}
                </h2>
                <p><strong>Phone:</strong> {o.phone}</p>
                <p><strong>Address:</strong> {o.address}</p>

                <h3 className="mt-3 font-semibold">Items:</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  {o.items?.map((item: any, index: number) => {
                    const sels = item.selections || {};
                    const entrees = sels.entrees || [];
                    const mains = sels.mains || [];
                    const desserts = sels.desserts || [];
                    const guests = item.guests || 0;
                    const price = item.price || 0;

                    return (
                      <li key={index}>
                        <strong>{item.name}</strong> — {guests} guests — ${(
                          price * guests
                        ).toFixed(2)}

                        <div className="ml-4">
                          {entrees.length > 0 && (
                            <p><strong>Entrees:</strong> {entrees.join(', ')}</p>
                          )}
                          {mains.length > 0 && (
                            <p><strong>Mains:</strong> {mains.join(', ')}</p>
                          )}
                          {desserts.length > 0 && (
                            <p><strong>Desserts:</strong> {desserts.join(', ')}</p>
                          )}
                          {sels.specialRequest && (
                            <p><strong>Notes:</strong> {sels.specialRequest}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
