"use client";

import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/config";

export default function CateringAdminPage() {
  const db = getFirestore(app);

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any>(null);
  const [active, setActive] = useState<"standard" | "premium" | "deluxe">(
    "standard"
  );

  // Load all 3 packages
  useEffect(() => {
    async function load() {
      const std = await getDoc(doc(db, "cateringPackages", "standard"));
      const prem = await getDoc(doc(db, "cateringPackages", "premium"));
      const del = await getDoc(doc(db, "cateringPackages", "deluxe"));

      setPackages({
        standard: std.data(),
        premium: prem.data(),
        deluxe: del.data(),
      });

      setLoading(false);
    }

    load();
  }, []);

  // Save to Firestore
  async function savePackage() {
    const pkg = active;
    const data = packages[pkg];

    await fetch("/api/admin/catering/update", {
      method: "POST",
      body: JSON.stringify({ pkg, data }),
    });

    alert("✅ Saved successfully!");
  }

  if (loading || !packages) return <p className="p-10">Loading…</p>;

  const pkg = packages[active];

  // Helper to update fields
  const updateField = (field: string, value: any) => {
    setPackages({
      ...packages,
      [active]: {
        ...packages[active],
        [field]: value,
      },
    });
  };

  // Update limits (entrees/mains/desserts)
  const updateLimit = (category: string, value: number) => {
    setPackages({
      ...packages,
      [active]: {
        ...packages[active],
        limits: {
          ...packages[active].limits,
          [category]: value,
        },
      },
    });
  };

  // Update options list
  const updateOptions = (category: string, newList: string[]) => {
    setPackages({
      ...packages,
      [active]: {
        ...packages[active],
        options: {
          ...packages[active].options,
          [category]: newList,
        },
      },
    });
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Catering Menu Editor</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["standard", "premium", "deluxe"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded ${
              active === t ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActive(t as any)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Basic fields */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <label className="font-semibold">Package Name</label>
        <input
          className="border p-2 w-full mb-4 rounded"
          value={pkg.name}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <label className="font-semibold">Price per person</label>
        <input
          type="number"
          className="border p-2 w-full mb-4 rounded"
          value={pkg.price}
          onChange={(e) => updateField("price", Number(e.target.value))}
        />

        <label className="font-semibold">Minimum Guests</label>
        <input
          type="number"
          className="border p-2 w-full mb-4 rounded"
          value={pkg.minGuests}
          onChange={(e) => updateField("minGuests", Number(e.target.value))}
        />
      </div>

      {/* Limits */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Selection Limits</h2>

        {["entrees", "mains", "desserts"].map((cat) => (
          <div key={cat} className="mb-4">
            <label className="font-semibold">{cat.toUpperCase()} Limit</label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={pkg.limits[cat]}
              onChange={(e) => updateLimit(cat, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      {/* Options Editor */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Menu Items</h2>

        {["entrees", "mains", "desserts"].map((cat) => (
          <div key={cat} className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{cat.toUpperCase()}</h3>

            {pkg.options[cat].map((item: string, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  className="border p-2 rounded flex-1"
                  value={item}
                  onChange={(e) => {
                    const newList = [...pkg.options[cat]];
                    newList[index] = e.target.value;
                    updateOptions(cat, newList);
                  }}
                />
                <button
                  className="bg-red-500 text-white px-4 rounded"
                  onClick={() => {
                    const newList = pkg.options[cat].filter(
                      (_: any, i: number) => i !== index
                    );
                    updateOptions(cat, newList);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}

            {/* Add new item */}
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={() =>
                updateOptions(cat, [...pkg.options[cat], "New Item"])
              }
            >
              Add Item
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        onClick={savePackage}
      >
        Save Changes
      </button>
    </div>
  );
}
