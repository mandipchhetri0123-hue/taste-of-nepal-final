'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { getAuth } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('Please login before placing your order.');
      router.push('/auth/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userEmail: user.email,
        name,
        phone,
        address,
        cartItems: cart,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      clearCart();
      alert('✅ Order placed successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('❌ Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-red-700">Checkout</h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Your Order Summary</h2>
            <ul className="mb-6 border rounded p-4 bg-gray-50">
              {cart.map((item, index) => (
                <li key={index} className="border-b py-2">
                  <strong>{item.name}</strong> – {item.price}
                  {item.selections && (
                    <ul className="ml-5 text-sm text-gray-600 list-disc">
                      {item.selections.entrees?.length > 0 && (
                        <li>Entrees: {item.selections.entrees.join(', ')}</li>
                      )}
                      {item.selections.mains?.length > 0 && (
                        <li>Mains: {item.selections.mains.join(', ')}</li>
                      )}
                      {item.selections.desserts?.length > 0 && (
                        <li>Desserts: {item.selections.desserts.join(', ')}</li>
                      )}
                      {item.selections.specialRequest && (
                        <li>Note: {item.selections.specialRequest}</li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <form onSubmit={handleCheckout} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-3 border rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <textarea
                placeholder="Delivery Address"
                className="w-full p-3 border rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
