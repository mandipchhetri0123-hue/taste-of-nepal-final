import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Use restaurant UID as restaurantId
        setRestaurantId(user.uid);

        const q = query(
          collection(db, "orders"),
          where("restaurantId", "==", user.uid),
          where("status", "==", "pending")
        );

        // Real-time listener for pending orders
        const unsubscribeOrders = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersData);
          setLoading(false);
        });

        return () => unsubscribeOrders();
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const acceptOrder = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), { status: "accepted" });
    alert("✅ Order accepted!");
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Restaurant Dashboard</h1>
      {orders.length === 0 ? (
        <p>No pending orders right now.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded p-4 bg-gray-50 shadow-md"
            >
              <h2 className="font-semibold text-lg">Order #{order.id}</h2>
              <ul className="mt-2">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} — ${item.price} × {item.qty}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                Status: {order.status}
              </p>
              <button
                onClick={() => acceptOrder(order.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 mt-3 rounded"
              >
                Accept Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
