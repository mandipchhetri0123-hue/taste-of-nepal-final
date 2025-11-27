'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const auth = getAuth(app);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // -----------------------------
  // NEW: AU Address Fields
  // -----------------------------
  const [address, setAddress] = useState<{
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  }>({});

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.guests, 0),
    [cart]
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">No items in cart</h1>
        <button
          onClick={() => router.push('/menu')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  // ============================================================
  // FORM SUBMISSION
  // ============================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address.street || !address.suburb || !address.state || !address.postcode) {
      alert("Please fill in Full Name, Phone, and all Address fields.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Please login before placing an order.");
      router.push("/login");
      return;
    }

    setSaving(true);

    // Convert multi-field address → old 1-line format
    const finalAddress = `${address.street}, ${address.suburb}, ${address.state} ${address.postcode}`;

    // Save data for payment page
    sessionStorage.setItem(
      "checkoutCustomer",
      JSON.stringify({
        fullName,
        phone,
        address: finalAddress, // 👈 stored as single string (compatible with old system)
        note,
      })
    );

    setTimeout(() => {
      router.push("/checkout/payment");
    }, 50);
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

        <ul className="space-y-2 text-sm">
          {cart.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> — {item.guests} guests — $
              {(item.price * item.guests).toFixed(2)}
            </li>
          ))}
        </ul>

        <p className="mt-3 font-bold">
          Total: ${total.toFixed(2)}
        </p>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block font-semibold mb-1">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            className="border p-2 w-full rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-1">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            className="border p-2 w-full rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 04xx xxx xxx"
            required
          />
        </div>

        {/* ---------------------------
             NEW AU STYLE ADDRESS FIELDS
           --------------------------- */}
        <div>
          <label className="block font-semibold mb-1">
            Delivery / Event Address<span className="text-red-500">*</span>
          </label>

          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Unit / Street Address"
              value={address.street || ""}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
              required
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Suburb"
              value={address.suburb || ""}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, suburb: e.target.value }))
              }
              required
            />
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              className="border p-2 rounded w-full"
              value={address.state || ""}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, state: e.target.value }))
              }
              required
            >
              <option value="">State</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="WA">WA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>

            <input
              className="border p-2 rounded w-full"
              placeholder="Postcode"
              value={address.postcode || ""}
              maxLength={4}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, postcode: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* Extra Notes */}
        <div>
          <label className="block font-semibold mb-1">
            Extra Notes (optional)
          </label>
          <textarea
            className="border p-2 w-full rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Dietary restrictions, time, parking details..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full disabled:opacity-60"
        >
          {saving ? "Processing…" : "Proceed to Payment"}
        </button>
      </form>
    </div>
  );
}
