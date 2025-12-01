'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

type PackageKey = 'standard' | 'premium' | 'deluxe';

type MenuItem = {
  name: string;
  description: string;
  image: string;
  price?: number;
  stock?: number; // from global foodStock
};

type PackageData = {
  name: string;
  price: number; // per person
  minGuests: number;
  limits: {
    entrees: number;
    mains: number;
    desserts: number;
  };
  options: {
    entrees: MenuItem[];
    mains: MenuItem[];
    desserts: MenuItem[];
  };
};

type PackagesState = Record<PackageKey, PackageData>;

export default function MenuPage() {
  const { addToCart } = useCart();

  const [packages, setPackages] = useState<PackagesState | null>(null);
  const [activeTab, setActiveTab] = useState<PackageKey>('standard');
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  const [selectedItems, setSelectedItems] = useState({
    entrees: [] as string[],
    mains: [] as string[],
    desserts: [] as string[],
    specialRequest: '',
  });

  const [guests, setGuests] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/catering/list');
        const json = await res.json();

        if (json.error) {
          console.error('Catering load error:', json.error);
          setError(json.error);
        } else {
          setPackages(json as PackagesState);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !packages) {
    return (
      <div className="p-10 text-center text-xl">
        {error ? `Error loading menu: ${error}` : 'Loading Catering Menu…'}
      </div>
    );
  }

  const pkg = packages[activeTab];

  const handleCheckbox = (
    category: 'entrees' | 'mains' | 'desserts',
    itemName: string,
    limit: number
  ) => {
    setSelectedItems((prev) => {
      const selectedList = prev[category];

      if (selectedList.includes(itemName)) {
        return {
          ...prev,
          [category]: selectedList.filter((i) => i !== itemName),
        };
      }

      if (selectedList.length < limit) {
        return {
          ...prev,
          [category]: [...selectedList, itemName],
        };
      }

      alert(`❗ You can select only ${limit} items for ${category}.`);
      return prev;
    });
  };

  const handleAddToCart = () => {
    if (!selectedPackage) return;

    if (guests < selectedPackage.minGuests) {
      alert(`⚠️ Minimum ${selectedPackage.minGuests} guests required.`);
      return;
    }

    // STOCK VALIDATION
    const insufficient: string[] = [];

    (['entrees', 'mains', 'desserts'] as const).forEach((cat) => {
      selectedItems[cat].forEach((name) => {
        const opt = selectedPackage.options[cat].find((o) => o.name === name);
        const available = opt?.stock ?? 0;
        if (available < guests) {
          insufficient.push(`${name} (only ${available} portions available)`);
        }
      });
    });

    if (insufficient.length > 0) {
      alert(
        `⚠️ Not enough stock for:\n\n${insufficient.join(
          '\n'
        )}\n\nPlease reduce number of guests or change selected dishes.`
      );
      return;
    }

    addToCart({
      id: selectedPackage.name + '-' + Date.now(),
      packageId: activeTab,
      name: selectedPackage.name,
      price: selectedPackage.price,
      selections: selectedItems,
      guests: guests,
    });

    alert(`✅ Added to cart! Go to cart for payment.`);

    setSelectedPackage(null);
    setSelectedItems({ entrees: [], mains: [], desserts: [], specialRequest: '' });
    setGuests(selectedPackage.minGuests);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* FEATURED SECTION */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-16">
        <h2 className="text-4xl font-heading font-bold text-center mb-10">
          Our Signature Catering Dishes
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://img.freepik.com/premium-photo/deep-fried-chicken-nepali-snacks-with-chutney_723123-239.jpg"
              className="w-full h-56 object-cover"
              alt="Fried Chicken"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-2">Fried Chicken</h3>
              <p className="text-gray-600">Crispy and flavour-packed chicken for events.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://junifoods.com/wp-content/uploads/2023/04/easy-chicken-choila-1024x693.png"
              className="w-full h-56 object-cover"
              alt="Chicken Choila"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-2">Chicken Choila</h3>
              <p className="text-gray-600">Classic Nepali grilled spiced chicken.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <img
              src="https://boondockingrecipes.com/wp-content/uploads/2025/03/15.-Nepal-Slow-Cooker-Goat-Curry-Recipe-2-768x768.jpg"
              className="w-full h-56 object-cover"
              alt="Goat Curry"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-2">Goat Curry</h3>
              <p className="text-gray-600">Slow-cooked tender goat in rich spices.</p>
            </div>
          </div>
        </div>
      </section>

      <h1 className="text-4xl font-bold text-center mb-6">Our Catering Menu</h1>
      <p className="text-center text-gray-600 mb-10">
        Choose one of our packages below and customize it for your event.
      </p>

      {/* Tabs */}
      <div className="flex justify-center border-b mb-8">
        {(['standard', 'premium', 'deluxe'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 text-lg font-semibold ${
              activeTab === tab
                ? 'border-b-4 border-red-600 text-red-600'
                : 'text-gray-500'
            }`}
            onClick={() => {
              setActiveTab(tab);
              setSelectedPackage(null);
            }}
          >
            {packages[tab].name}
          </button>
        ))}
      </div>

      {/* Package Card */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
        <p className="text-gray-600">${pkg.price} per person</p>
        <p className="mt-3 text-gray-700">Minimum {pkg.minGuests} guests required.</p>

        <button
          onClick={() => {
            setSelectedPackage(pkg);
            setGuests(pkg.minGuests);
            setSelectedItems({
              entrees: [],
              mains: [],
              desserts: [],
              specialRequest: '',
            });
          }}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Customize & Add to Order
        </button>
      </div>

      {/* Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh]">
            <h1 className="text-3xl font-bold text-center mb-2">{selectedPackage.name}</h1>
            <p className="text-center text-gray-500 mb-6">
              ${selectedPackage.price} per person (Min {selectedPackage.minGuests} guests)
            </p>

            {/* Guests */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                min={selectedPackage.minGuests}
                value={guests}
                onChange={(e) =>
                  setGuests(Number(e.target.value) || selectedPackage.minGuests)
                }
                className="w-full p-3 border rounded"
              />
            </div>

            {/* Categories */}
            {(['entrees', 'mains', 'desserts'] as const).map((cat) => (
              <div key={cat} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {cat.toUpperCase()} (Select {selectedPackage.limits[cat]})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedPackage.options[cat].map((item, index) => {
                    const stock = item.stock ?? 0;
                    const outOfStock = stock <= 0;

                    return (
                      <label
                        key={`${cat}-${index}-${item.name}`}
                        className={`flex flex-col sm:flex-row gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          outOfStock ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={outOfStock}
                          checked={selectedItems[cat].includes(item.name)}
                          onChange={() =>
                            handleCheckbox(cat, item.name, selectedPackage.limits[cat])
                          }
                          className="mt-1"
                        />

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded"
                        />

                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-gray-600 text-sm leading-snug">
                            {item.description}
                          </p>
                          <p className="text-sm font-semibold text-red-600 mt-1">
                            {outOfStock
                              ? 'Out of stock'
                              : `Global Stock: ${stock} servings available`}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Special Requests */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Special Requests</label>
              <textarea
                value={selectedItems.specialRequest}
                onChange={(e) =>
                  setSelectedItems((prev) => ({
                    ...prev,
                    specialRequest: e.target.value,
                  }))
                }
                className="w-full p-3 border rounded"
                placeholder="e.g. Extra spicy, Nut allergy..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Add Package to Order
              </button>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-blue-600 hover:underline"
              >
                ← Cancel and Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
