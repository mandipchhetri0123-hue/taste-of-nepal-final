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
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.guests, 0),
    [cart]
  );

  // If cart empty → redirect message
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

  // Handle NEXT STEP → store details & go to payment page
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address) {
      alert('Please fill in Full Name, Phone and Address.');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert('Please login before placing an order.');
      router.push('/login');
      return;
    }

    setSaving(true);

    // Save customer details temporarily for payment page
    sessionStorage.setItem(
      'checkoutCustomer',
      JSON.stringify({
        fullName,
        phone,
        address,
        note,
      })
    );

    // Redirect to payment page
    router.push('/checkout/payment');
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order summary */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block font-semibold mb-1">
            Delivery / Event Address<span className="text-red-500">*</span>
          </label>
          <textarea
            className="border p-2 w-full rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Street, suburb, postcode"
            required
          />
        </div>

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
          {saving ? 'Processing…' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}
