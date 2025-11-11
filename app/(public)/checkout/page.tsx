'use client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
          onClick={() => router.push('/menu')}
        >
          Go Back to Menu
        </button>
      </div>
    );
  }

  const total = cart.reduce((acc, item) => acc + item.price * (item.guests ?? 0), 0);

  const handlePlaceOrder = () => {
    setSubmitting(true);
    setTimeout(() => {
      clearCart();
      alert('✅ Your order has been placed successfully!');
      router.push('/');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-6">Checkout</h1>
      <p className="text-center text-gray-600 mb-10">
        Review your order details below before confirming.
      </p>

      <div className="bg-white shadow-md rounded-lg p-8">
        {cart.map((item) => (
          <div key={item.id} className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-semibold mb-1">{item.name}</h2>
            <p className="text-gray-700">
              💰 ${item.price} × 👥 {item.guests ?? 0} guests
            </p>
            <p className="text-gray-700 font-semibold mt-1">
              Total: ${(item.price * (item.guests ?? 0)).toFixed(2)}
            </p>

            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Entrees:</strong> {item.selections.entrees.join(', ')}</p>
              <p><strong>Mains:</strong> {item.selections.mains.join(', ')}</p>
              <p><strong>Desserts:</strong> {item.selections.desserts.join(', ')}</p>
              {item.selections.specialRequest && (
                <p><strong>Note:</strong> {item.selections.specialRequest}</p>
              )}
            </div>
          </div>
        ))}

        <div className="text-right mt-6">
          <p className="text-2xl font-bold text-gray-800 mb-6">
            Grand Total: ${total.toFixed(2)}
          </p>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-70"
          >
            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </div>

        <button
          onClick={() => router.push('/cart')}
          className="text-blue-600 underline mt-6 block text-center"
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}
