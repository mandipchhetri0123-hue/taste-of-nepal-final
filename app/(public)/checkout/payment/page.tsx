"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function PaymentPage() {
  const router = useRouter();
  const { cart } = useCart();
  const auth = getAuth(app);

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Calculate total
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.guests, 0),
    [cart]
  );

  // Load checkout info
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutCustomer");
    if (!data) router.push("/checkout");
    else setCustomer(JSON.parse(data));
  }, [router]);

  const handlePayment = async () => {
    if (!customer) return;
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in before paying.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            userId: user.uid,
            fullName: customer.fullName,
            phone: customer.phone,
            address: customer.address,
            note: customer.note,
            email: user.email,
          },
          items: cart,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Stripe redirect
      } else {
        alert("Payment failed to start.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment could not start.");
    }

    setLoading(false);
  };

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white shadow-lg p-8 rounded max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Secure Payment</h1>

        <p className="text-center text-gray-600 mb-6">
          You will be redirected to the secure Stripe Checkout page.
        </p>

        <div className="border p-4 rounded bg-gray-50 mb-4">
          <h2 className="font-semibold mb-2">Order Total</h2>
          <p className="text-xl font-bold">${total.toFixed(2)}</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded text-xl"
        >
          {loading ? "Processing..." : "Pay with Card"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          🔒 Payments are securely processed by Stripe.
        </p>
      </div>
    </div>
  );
}
