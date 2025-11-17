"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [customer, setCustomer] = useState<any>(null);

  // Payment inputs
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 FIX: Calculate total manually (your CartContext has no totalAmount())
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.guests, 0),
    [cart]
  );

  // Load temp checkout details
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutCustomer");
    if (!data) router.push("/checkout");
    else setCustomer(JSON.parse(data));
  }, []);

  const handlePay = async () => {
    if (!cardName || !cardNumber || !exp || !cvv) {
      alert("Please fill all payment details.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in.");
      router.push("/login");
      return;
    }

    setLoading(true);

    // Simulate payment delay (no real card processing)
    await new Promise((r) => setTimeout(r, 1500));

    // Save order to Firestore
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      items: cart,
      totalAmount: total,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      note: customer.note,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    clearCart();
    sessionStorage.removeItem("checkoutCustomer");

    router.push("/success");
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white shadow-lg p-8 rounded max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Secure Payment</h1>

        <div className="flex justify-center mb-4">
          <img src="/visa.png" className="h-8 mr-2" />
          <img src="/mastercard.png" className="h-8" />
        </div>

        <label className="block mb-3">
          <span className="font-semibold">Name on Card</span>
          <input
            className="w-full p-3 border rounded mt-1"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
          />
        </label>

        <label className="block mb-3">
          <span className="font-semibold">Card Number</span>
          <input
            className="w-full p-3 border rounded mt-1"
            maxLength={16}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
          />
        </label>

        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="font-semibold">Expiry</span>
            <input
              className="w-full p-3 border rounded mt-1"
              maxLength={5}
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              placeholder="MM/YY"
            />
          </label>

          <label className="block w-24">
            <span className="font-semibold">CVV</span>
            <input
              className="w-full p-3 border rounded mt-1"
              maxLength={3}
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
            />
          </label>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-red-600 text-white p-4 rounded mt-6 text-xl hover:bg-red-700"
        >
          {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          🔒 Your payment is securely simulated.
        </p>
      </div>
    </div>
  );
}
