'use client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600">Add items to your cart to start your order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Your Order</h1>

      {cart.map((item) => (
        <div key={item.id} className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
          <p className="text-gray-600">{item.price}</p>
          {item.guests && <p className="text-gray-600">Guests: {item.guests}</p>}

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
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 mr-3"
          onClick={() => router.push('/checkout')}
        >
          Checkout
        </button>
        <button
          className="bg-gray-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-400"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
