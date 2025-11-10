'use client';
import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import { app } from '@/lib/firebase';
export default function MenuPage() {
  const { addToCart } = useCart();
  const [activePage, setActivePage] = useState<'home' | 'menu' | 'customize'>('home');
  const [activePackage, setActivePackage] = useState<any>(null);
  const auth = getAuth(app);


  // Package configurations
  const PACKAGE_CONFIG: any = {
    standard: {
      name: "Standard Menu Package",
      priceText: "$25.00 per person (Min 30 guests)",
      limits: { entrees: 2, mains: 2, desserts: 1 },
      options: {
        entrees: ["Pakoda", "Aloo Dum", "Bhatmas Sadheko", "Peanut Sadheko", "Prawn Crackers", "Chiura"],
        mains: ["Dal", "Rajma", "Chicken Curry", "Paneer Kerau", "Aloo Kauli"],
        desserts: ["Lalmohan"],
      },
    },
    premium: {
      name: "Premium Menu Package",
      priceText: "$30.00 per person (Min 30 guests)",
      limits: { entrees: 3, mains: 3, desserts: 1 },
      options: {
        entrees: ["Samosa Chat", "Pakoda", "Aloo Dum", "Chicken Choila", "Bhatmas Sadheko", "Peanut Sadheko"],
        mains: ["Dal", "Rajma", "Chicken Curry", "Goat Curry (+$2 pp)", "Paneer Kerau", "Aloo Kauli"],
        desserts: ["Dudhbari", "Gajarko Haluwa", "Lalmohan"],
      },
    },
    deluxe: {
      name: "Deluxe Menu Package",
      priceText: "$35.00 per person (Min 30 guests)",
      limits: { entrees: 4, mains: 3, desserts: 2 },
      options: {
        entrees: ["Fried Chicken", "Samosa Chat", "Pakoda", "Aloo Dum", "Chicken Choila"],
        mains: ["Dal", "Rajma", "Chicken Curry", "Goat Curry", "Paneer Kerau", "Aloo Kauli"],
        desserts: ["Dudhbari", "Gajarko Haluwa", "Lalmohan"],
      },
    },
  };

  // Function to add to cart
  const handleAddToCart = () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please login before adding to cart.');
      window.location.href = '/auth/login';
      return;
    }

    const selections = {
      entrees: Array.from(document.querySelectorAll("input[name='entrees']:checked")).map(
        (i) => (i as HTMLInputElement).value
      ),
      mains: Array.from(document.querySelectorAll("input[name='mains']:checked")).map(
        (i) => (i as HTMLInputElement).value
      ),
      desserts: Array.from(document.querySelectorAll("input[name='desserts']:checked")).map(
        (i) => (i as HTMLInputElement).value
      ),
      specialRequest: (document.getElementById("pkg-special-requests") as HTMLTextAreaElement)?.value || "",
    };

    // Add to cart
    addToCart({
      id: Date.now().toString(),
      name: activePackage.name,
      price: activePackage.priceText,
      selections,
    });

    alert('Package added to your cart successfully!');
    window.location.href = '/cart';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🏠 HOME PAGE */}
      {activePage === 'home' && (
        <section className="text-center py-20">
          <h1 className="text-5xl font-bold mb-4 text-red-700">Taste of Nepal</h1>
          <p className="text-lg text-gray-600">Authentic Flavours from the Himalayas</p>
          <button
            className="bg-red-600 text-white px-6 py-3 mt-6 rounded-lg hover:bg-red-700"
            onClick={() => setActivePage('menu')}
          >
            View Our Menu
          </button>
        </section>
      )}

      {/* 🍱 MENU PAGE */}
      {activePage === 'menu' && (
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-6">Our Catering Menu</h1>
          <p className="text-center text-gray-600 mb-8">
            We offer flexible packages to suit any event. Choose one of our popular menus below or contact us for a custom quote.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {Object.entries(PACKAGE_CONFIG).map(([key, pkg]: any) => (
              <div key={key} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{pkg.name}</h2>
                <p className="text-gray-600 mb-2">{pkg.priceText}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Includes a variety of authentic Nepali dishes, freshly prepared for your event.
                </p>
                <button
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                  onClick={() => {
                    setActivePackage(pkg);
                    setActivePage('customize');
                  }}
                >
                  Customize & Add to Order
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🧾 CUSTOMIZE PACKAGE PAGE */}
      {activePage === 'customize' && activePackage && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-2">{activePackage.name}</h1>
            <p className="text-center text-gray-500 mb-6">{activePackage.priceText}</p>

            <form className="space-y-6">
              {/* ENTREES */}
              <div>
                <h3 className="text-xl font-bold mb-2">Entrees (Select {activePackage.limits.entrees})</h3>
                {activePackage.options.entrees.map((item: string) => (
                  <label key={item} className="flex items-center gap-2 p-2 border rounded mb-2">
                    <input type="checkbox" name="entrees" value={item} /> {item}
                  </label>
                ))}
              </div>

              {/* MAINS */}
              <div>
                <h3 className="text-xl font-bold mb-2">Mains (Select {activePackage.limits.mains})</h3>
                {activePackage.options.mains.map((item: string) => (
                  <label key={item} className="flex items-center gap-2 p-2 border rounded mb-2">
                    <input type="checkbox" name="mains" value={item} /> {item}
                  </label>
                ))}
              </div>

              {/* DESSERTS */}
              <div>
                <h3 className="text-xl font-bold mb-2">Desserts (Select {activePackage.limits.desserts})</h3>
                {activePackage.options.desserts.map((item: string) => (
                  <label key={item} className="flex items-center gap-2 p-2 border rounded mb-2">
                    <input type="checkbox" name="desserts" value={item} /> {item}
                  </label>
                ))}
              </div>

              {/* SPECIAL REQUESTS */}
              <div>
                <label className="block text-lg font-semibold mb-2">Special Requests</label>
                <textarea
                  id="pkg-special-requests"
                  className="w-full p-3 border rounded"
                  placeholder="e.g., extra spicy, nut allergy, goat curry option..."
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
                  onClick={handleAddToCart}
                >
                  Add Package to Order
                </button>
                <button
                  type="button"
                  className="w-full text-blue-600 hover:underline"
                  onClick={() => setActivePage('menu')}
                >
                  ← Cancel and Go Back
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
