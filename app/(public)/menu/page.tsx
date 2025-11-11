'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function MenuPage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'standard' | 'premium' | 'deluxe'>('standard');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState({
    entrees: [] as string[],
    mains: [] as string[],
    desserts: [] as string[],
    specialRequest: ''
  });
  const [guests, setGuests] = useState<number>(15); // default to 15 guests

  const PACKAGE_CONFIG: any = {
    standard: {
      name: 'Standard Menu Package',
      price: 25,
      minGuests: 15,
      limits: { entrees: 2, mains: 2, desserts: 1 },
      options: {
        entrees: ['Pakoda', 'Aloo Dum', 'Bhatmas Sadheko', 'Peanut Sadheko', 'Prawn Crackers', 'Chiura'],
        mains: ['Dal', 'Rajma', 'Chicken Curry', 'Paneer Kerau', 'Aloo Kauli'],
        desserts: ['Lalmohan']
      }
    },
    premium: {
      name: 'Premium Menu Package',
      price: 30,
      minGuests: 15,
      limits: { entrees: 3, mains: 3, desserts: 1 },
      options: {
        entrees: ['Samosa Chat', 'Pakoda', 'Aloo Dum', 'Chicken Choila', 'Bhatmas Sadheko', 'Peanut Sadheko', 'Furandana'],
        mains: ['Dal', 'Rajma', 'Chicken Curry', 'Goat Curry (+$2 pp)', 'Paneer Kerau', 'Aloo Kauli'],
        desserts: ['Dudhbari', 'Gajarko Haluwa', 'Lalmohan']
      }
    },
    deluxe: {
      name: 'Deluxe Menu Package',
      price: 35,
      minGuests: 25,
      limits: { entrees: 4, mains: 3, desserts: 2 },
      options: {
        entrees: ['Fried Chicken', 'Samosa Chat', 'Pakoda', 'Aloo Dum', 'Chicken Choila', 'Bhatmas Sadheko', 'Peanut Sadheko'],
        mains: ['Dal', 'Rajma', 'Chicken Curry', 'Goat Curry', 'Paneer Kerau', 'Aloo Kauli'],
        desserts: ['Dudhbari', 'Gajarko Haluwa', 'Lalmohan']
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'standard' | 'premium' | 'deluxe') => {
    setActiveTab(tab);
    setSelectedPackage(null);
  };

  // Handle checkbox selections
  const handleCheckbox = (category: 'entrees' | 'mains' | 'desserts', item: string, limit: number) => {
    setSelectedItems((prev) => {
      const current = prev[category];
      if (current.includes(item)) {
        return { ...prev, [category]: current.filter((i) => i !== item) };
      } else if (current.length < limit) {
        return { ...prev, [category]: [...current, item] };
      }
      return prev;
    });
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedPackage) return;
    if (guests < selectedPackage.minGuests) {
      alert(`⚠️ Minimum ${selectedPackage.minGuests} guests required for this package.`);
      return;
    }

    addToCart({
      id: selectedPackage.name + '-' + Date.now(),
      name: selectedPackage.name,
      price: selectedPackage.price,
      selections: selectedItems,
      guests: guests
    });

    alert(`✅ ${selectedPackage.name} added for ${guests} guests!`);
    setSelectedPackage(null);
    setSelectedItems({ entrees: [], mains: [], desserts: [], specialRequest: '' });
    setGuests(15);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
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
              activeTab === tab ? 'border-b-4 border-red-600 text-red-600' : 'text-gray-500'
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Menu
          </button>
        ))}
      </div>

      {/* Package cards */}
      <div className="max-w-3xl mx-auto">
        {(['standard', 'premium', 'deluxe'] as const).map(
          (pkg) =>
            activeTab === pkg && (
              <div key={pkg} className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold mb-2">{PACKAGE_CONFIG[pkg].name}</h2>
                <p className="text-gray-600">${PACKAGE_CONFIG[pkg].price} per person</p>
                <p className="mt-3 text-gray-700">
                  Minimum {PACKAGE_CONFIG[pkg].minGuests} guests required.
                </p>
                <button
                  onClick={() => setSelectedPackage(PACKAGE_CONFIG[pkg])}
                  className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Customize & Add to Order
                </button>
              </div>
            )
        )}
      </div>

      {/* Package Customizer Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh]">
            <h1 className="text-3xl font-bold text-center mb-2">{selectedPackage.name}</h1>
            <p className="text-center text-gray-500 mb-6">
              ${selectedPackage.price} per person (Min {selectedPackage.minGuests} guests)
            </p>

            {/* Guests input */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Number of Guests</label>
              <input
                type="number"
                min={selectedPackage.minGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full p-3 border rounded"
              />
            </div>

            {/* Entrees */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Entrees (Select {selectedPackage.limits.entrees})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedPackage.options.entrees.map((item: string) => (
                  <label key={item} className="flex items-center space-x-2 border p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedItems.entrees.includes(item)}
                      onChange={() =>
                        handleCheckbox('entrees', item, selectedPackage.limits.entrees)
                      }
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mains */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Mains (Select {selectedPackage.limits.mains})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedPackage.options.mains.map((item: string) => (
                  <label key={item} className="flex items-center space-x-2 border p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedItems.mains.includes(item)}
                      onChange={() => handleCheckbox('mains', item, selectedPackage.limits.mains)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Desserts */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Desserts (Select {selectedPackage.limits.desserts})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedPackage.options.desserts.map((item: string) => (
                  <label key={item} className="flex items-center space-x-2 border p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedItems.desserts.includes(item)}
                      onChange={() =>
                        handleCheckbox('desserts', item, selectedPackage.limits.desserts)
                      }
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Special Requests</label>
              <textarea
                className="w-full p-3 border rounded"
                placeholder="e.g. Extra spicy, Nut allergy..."
                value={selectedItems.specialRequest}
                onChange={(e) =>
                  setSelectedItems((prev) => ({ ...prev, specialRequest: e.target.value }))
                }
              ></textarea>
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
