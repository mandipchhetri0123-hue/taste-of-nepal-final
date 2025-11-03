import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface MenuItem {
  name: string;
  price: number;
  image?: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location?: string;
  image?: string;
  menu?: MenuItem[];
}

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ Fix: unwrap params Promise properly

  if (!id) {
    return <p>⚠️ Restaurant ID not provided.</p>;
  }

  const docRef = doc(db, "restaurants", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return <p>🚫 Restaurant not found.</p>;
  }

  const restaurant = { id: snap.id, ...snap.data() } as Restaurant;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-4">{restaurant.name}</h1>
      <p className="text-gray-600">{restaurant.cuisine}</p>
      {restaurant.location && <p className="text-gray-500">{restaurant.location}</p>}

      {restaurant.image && (
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full max-w-2xl h-80 object-cover rounded-xl mt-6 shadow"
        />
      )}

      <h2 className="text-2xl font-semibold mt-10 mb-4">Menu</h2>
      {restaurant.menu && restaurant.menu.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {restaurant.menu.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
              )}
              <h3 className="font-semibold text-lg mt-2">{item.name}</h3>
              <p className="text-gray-700">${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No menu items found.</p>
      )}
    </div>
  );
}
