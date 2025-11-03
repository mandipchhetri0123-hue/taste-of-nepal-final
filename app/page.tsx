import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location?: string;
  image?: string;
}

export default async function HomePage() {
  const snapshot = await getDocs(collection(db, "restaurants"));
  const restaurants: Restaurant[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Restaurant, "id">),
  }));

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">🍛 Taste of Nepal</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <div key={r.id} className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
            {r.image ? (
              <img src={r.image} alt={r.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-xl">{r.name}</h2>
              <p className="text-gray-600">{r.cuisine}</p>
              {r.location && <p className="text-gray-500 text-sm">{r.location}</p>}
              <Link href={`/restaurant/${r.id}`} className="text-blue-500 underline mt-2 inline-block">
                View Menu →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
