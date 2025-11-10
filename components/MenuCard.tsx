"use client";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <div className="card">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-3" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
        <span className="font-semibold">${item.price.toFixed(2)}</span>
      </div>
      <button className="btn mt-3" onClick={() => add(item)}>Add to cart</button>
    </div>
  );
}
