'use client';
import { useCart } from '@/context/CartContext';

export default function MenuCard({ item }: { item: any }) {
  const { addToCart } = useCart();

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white text-center">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover rounded mb-3"
        />
      )}
      <h2 className="text-xl font-bold">{item.name}</h2>
      <p className="text-gray-600 mb-2">{item.description}</p>
      <p className="text-red-600 font-semibold mb-3">${item.price}</p>

      <button
        onClick={() => addToCart(item)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
