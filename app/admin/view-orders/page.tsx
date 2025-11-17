"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { app } from "@/lib/firebase";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

type OrderDoc = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  totalAmount: number;
  items: any[];
};

export default function ViewOrders() {
  const db = getFirestore(app);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [newOrderPopup, setNewOrderPopup] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    let firstLoad = true;

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      // Detect if a new order has been added
      if (!firstLoad && list.length > orders.length) {
        setNewOrderPopup(true);
        setTimeout(() => setNewOrderPopup(false), 4000);
      }

      firstLoad = false;
      setOrders(list as OrderDoc[]);
    });

    return () => unsubscribe();
  }, [orders.length, db]);

  return (
    <AdminRoute>
      <div className="p-10 relative">

        {/* 🔔 New Order Popup */}
        {newOrderPopup && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-xl animate-pulse">
            🔔 New Order Received!
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6">Customer Orders (Real-Time)</h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((o, idx) => (
              <div
                key={o.id}
                className="border rounded-lg p-4 bg-white shadow-sm transition"
              >
                <h2 className="text-xl font-semibold">
                  {o.fullName} — ${o.totalAmount?.toFixed(2)}
                </h2>
                <p><strong>Phone:</strong> {o.phone}</p>
                <p><strong>Address:</strong> {o.address}</p>

                <h3 className="mt-3 font-semibold">Items:</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  {o.items?.map((item: any, index: number) => {
                    const sel = item.selections || {};
                    return (
                      <li key={index}>
                        <strong>{item.name}</strong> — {item.guests} guests — $
                        {(item.price * item.guests).toFixed(2)}
                        <div className="ml-4 text-sm text-gray-700">
                          {sel.entrees?.length > 0 && (
                            <p><strong>Entrees:</strong> {sel.entrees.join(", ")}</p>
                          )}
                          {sel.mains?.length > 0 && (
                            <p><strong>Mains:</strong> {sel.mains.join(", ")}</p>
                          )}
                          {sel.desserts?.length > 0 && (
                            <p><strong>Desserts:</strong> {sel.desserts.join(", ")}</p>
                          )}
                          {sel.specialRequest && (
                            <p><strong>Notes:</strong> {sel.specialRequest}</p>
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
