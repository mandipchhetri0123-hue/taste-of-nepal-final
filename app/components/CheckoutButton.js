import { db, auth } from "../lib/firebase"; // relative path

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

export default function CheckoutButton({ restaurantId, items }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        restaurantId: restaurantId,
        items: items,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("✅ Order placed successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("❌ Failed to place order.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      disabled={loading}
    >
      {loading ? "Processing..." : "Checkout"}
    </button>
  );
}
 
