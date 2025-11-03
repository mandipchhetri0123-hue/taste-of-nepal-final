import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
}

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "orders"), where("restaurantId", "==", user.uid), where("status", "==", "pending"));
        const unsubscribeOrders = onSnapshot(q, (snapshot) => {
          setOrders(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) })));
          setLoading(false);
        });
        return () => unsubscribeOrders();
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const acceptOrder = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: "accepted" });
    alert("✅ Order accepted!");
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Restaurant Dashboard</h1>
      {orders.length === 0 ? (
        <p>No pending orders</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border p-4 rounded shadow-md mb-3">
            <h2 className="font-semibold">Order #{order.id}</h2>
            <ul>
              {order.items.map((i, idx) => (
                <li key={idx}>
                  {i.name} — ${i.price} × {i.qty}
                </li>
              ))}
            </ul>
            <button
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => acceptOrder(order.id)}
            >
              Accept Order
            </button>
          </div>
        ))
      )}
    </div>
  );
}
