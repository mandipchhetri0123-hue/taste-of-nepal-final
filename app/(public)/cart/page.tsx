'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add items to your cart to start your order.</p>
        <Link
          href="/menu"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Go to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-700">Your Cart</h1>

      {cart.map((item) => (
        <div
          key={item.id}
          className="border p-4 rounded-lg mb-6 bg-white shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
          <p className="text-gray-600">{item.price}</p>

          {item.selections && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              {item.selections.entrees?.length > 0 && (
                <p>
                  <strong>Entrees:</strong> {item.selections.entrees.join(', ')}
                </p>
              )}
              {item.selections.mains?.length > 0 && (
                <p>
                  <strong>Mains:</strong> {item.selections.mains.join(', ')}
                </p>
              )}
              {item.selections.desserts?.length > 0 && (
                <p>
                  <strong>Desserts:</strong> {item.selections.desserts.join(', ')}
                </p>
              )}
              {item.selections.specialRequest && (
                <p>
                  <strong>Note:</strong> {item.selections.specialRequest}
                </p>
              )}
            </div>
          )}

          <button
            className="text-red-600 mt-3 hover:underline text-sm"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="text-center mt-10 flex flex-col sm:flex-row justify-center gap-4">
        {user ? (
          <Link
            href="/checkout"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Proceed to Checkout
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login to Checkout
          </Link>
        )}

        <button
          className="bg-gray-300 text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
