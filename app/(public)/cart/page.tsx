'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.guests,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">
          You haven&apos;t selected any catering package yet.
        </p>
        <button
          onClick={() => router.push('/menu')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Catering Cart</h1>

      <div className="space-y-6 max-w-4xl mx-auto">
        {cart.map((item) => {
          const itemTotal = item.price * item.guests;
          const sels = item.selections || {
            entrees: [],
            mains: [],
            desserts: [],
            specialRequest: '',
          };

          return (
            <div
              key={item.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} per person × {item.guests} guests
                  </p>
                </div>
                <p className="text-lg font-bold">
                  ${itemTotal.toFixed(2)}
                </p>
              </div>

              <div className="text-sm space-y-1">
                {sels.entrees?.length > 0 && (
                  <p>
                    <strong>Entrees:</strong> {sels.entrees.join(', ')}
                  </p>
                )}
                {sels.mains?.length > 0 && (
                  <p>
                    <strong>Mains:</strong> {sels.mains.join(', ')}
                  </p>
                )}
                {sels.desserts?.length > 0 && (
                  <p>
                    <strong>Desserts:</strong> {sels.desserts.join(', ')}
                  </p>
                )}
                {sels.specialRequest && (
                  <p>
                    <strong>Special Request:</strong> {sels.specialRequest}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="mt-4 text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto mt-8 flex items-center justify-between">
        <p className="text-xl font-bold">
          Total: ${grandTotal.toFixed(2)} (Stripe payment)
        </p>
        <button
          onClick={() => router.push('/checkout')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
