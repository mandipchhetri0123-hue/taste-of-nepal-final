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

  // ⭐ NEW: saving state to prevent double click
  const [saving, setSaving] = useState(false);

  // Load all packages
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

  // ⭐ Save entire package AND sync stock
  async function savePackage() {
    if (saving) return; // stop double click
    setSaving(true);

    const pkg = active;
    const data = packages[pkg];

    try {
      // 🔸 1. Save catering package
      const res = await fetch("/api/admin/catering/update", {
        method: "POST",
        body: JSON.stringify({ pkg, data }),
      });

      if (!res.ok) {
        alert("❌ Failed to save catering package!");
        setSaving(false);
        return;
      }

      // 🔸 2. Sync all dishes to stock
      const categories = ["entrees", "mains", "desserts"];

      for (const category of categories) {
        for (const item of data.options[category]) {
          await fetch("/api/stock/create", {
            method: "POST",
            body: JSON.stringify({ name: item.name }),
          });
        }
      }

      alert("✅ Saved and Stock Synced Successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong during save");
    }

    setSaving(false);
  }

  if (loading || !packages) return <p className="p-10">Loading…</p>;

  const pkg = packages[active];

  // Update package-level fields
  const updateField = (field: string, value: any) => {
    setPackages({
      ...packages,
      [active]: {
        ...packages[active],
        [field]: value,
      },
    });
  };

  // Update limits
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

  // Update menu items
  const updateOptions = (category: string, newList: any[]) => {
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

      {/* Basic Package Info */}
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

      {/* Selection Limits */}
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

      {/* Menu Items Editor */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Menu Items</h2>

        {["entrees", "mains", "desserts"].map((cat) => (
          <div key={cat} className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{cat.toUpperCase()}</h3>

            {pkg.options[cat].map((item: any, index: number) => (
              <div
                key={index}
                className="border p-4 rounded mb-3 bg-gray-50 space-y-2"
              >
                {/* Name */}
                <label className="font-semibold block">Item Name</label>
                <input
                  className="border p-2 rounded w-full"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...pkg.options[cat]];
                    updated[index].name = e.target.value;
                    updateOptions(cat, updated);
                  }}
                />

                {/* Image */}
                <label className="font-semibold block">Image URL</label>
                <input
                  className="border p-2 rounded w-full"
                  value={item.image}
                  onChange={(e) => {
                    const updated = [...pkg.options[cat]];
                    updated[index].image = e.target.value;
                    updateOptions(cat, updated);
                  }}
                />

                {/* Description */}
                <label className="font-semibold block">Description</label>
                <input
                  className="border p-2 rounded w-full"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...pkg.options[cat]];
                    updated[index].description = e.target.value;
                    updateOptions(cat, updated);
                  }}
                />

                {/* Delete */}
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded mt-2"
                  onClick={() => {
                    const newList = pkg.options[cat].filter(
                      (_: any, i: number) => i !== index
                    );
                    updateOptions(cat, newList);
                  }}
                >
                  Delete Item
                </button>
              </div>
            ))}

            {/* Add New Item */}
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={() =>
                updateOptions(cat, [
                  ...pkg.options[cat],
                  {
                    name: "New Item",
                    image: "https://placehold.co/150",
                    description: "Item description",
                  },
                ])
              }
            >
              Add New Item
            </button>
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <button
        className={`px-6 py-3 rounded text-lg text-white ${
          saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
        }`}
        disabled={saving}
        onClick={savePackage}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
