'use client';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setUser({ uid: user.uid, ...snapshot.data() });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold">Loading your cart...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600">
          You must be logged in to view your cart and place orders.
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600">
          Add items to your cart to start your order.
        </p>
      </div>
    );
  }

  // ✅ Safe parse price whether it's a string or number
  const getNumericPrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
  };

  const totalCost = cart.reduce((sum, item) => {
    const price = getNumericPrice(item.price);
    const guests = item.guests ?? 0;
    return sum + price * guests;
  }, 0);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: cart.map((item) => ({
            name: item.name,
            price: getNumericPrice(item.price),
            qty: item.guests || 1,
          })),
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cart`,
          orderDetails: {
            fullName: `${user.firstName} ${user.lastName}`,
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            packageName: cart[0].name,
            guests: cart[0].guests,
            price: cart[0].price,
            entrees: cart[0].selections.entrees,
            mains: cart[0].selections.mains,
            desserts: cart[0].selections.desserts,
          },
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert('❌ Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Error during checkout. Please try again later.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Your Order</h1>

      {cart.map((item) => (
        <div key={item.id} className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-2">{item.price} per person</p>
          <p className="text-gray-800 font-medium">
            Guests: {item.guests || 0}
          </p>

          {item.selections && (
            <div className="mt-3 text-sm text-gray-700">
              <p><strong>Entrees:</strong> {item.selections.entrees.join(', ')}</p>
              <p><strong>Mains:</strong> {item.selections.mains.join(', ')}</p>
              <p><strong>Desserts:</strong> {item.selections.desserts.join(', ')}</p>
              {item.selections.specialRequest && (
                <p><strong>Note:</strong> {item.selections.specialRequest}</p>
              )}
            </div>
          )}

          <button
            className="text-red-600 mt-3 hover:underline"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Total: ${totalCost.toFixed(2)}
        </h2>

        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 mr-3"
        >
          Checkout
        </button>

        <button
          onClick={clearCart}
          className="bg-gray-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-400"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
