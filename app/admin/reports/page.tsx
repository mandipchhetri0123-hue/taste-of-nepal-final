"use client";

import React, { useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { app } from "@/lib/firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";

type OrderDoc = {
  id: string;
  totalAmount?: number;
  items?: any[];
  createdAt?: Timestamp;
};

type PopularItem = {
  name: string;
  count: number;
};

export default function Reports() {
  const db = getFirestore(app);

  // ======================
  // SUMMARY & POPULAR ITEMS STATE
  // ======================
  const [summary, setSummary] = useState<{
    label: string;
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
  } | null>(null);

  const [popular, setPopular] = useState<{
    entrees: PopularItem[];
    mains: PopularItem[];
    desserts: PopularItem[];
  } | null>(null);

  const [loadingSummary, setLoadingSummary] = useState(false);

  // Custom date range (Option F)
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // ======================
  // MESSAGES STATE (Option H)
  // ======================
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // ======================
  // HELPERS – DATE RANGES
  // ======================

  // For custom range (yyyy-mm-dd → Firestore Timestamp)
  const makeRangeFromStrings = (startStr: string, endStr: string) => {
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);

    const start = Timestamp.fromDate(new Date(sy, sm - 1, sd, 0, 0, 0));
    const end = Timestamp.fromDate(new Date(ey, em - 1, ed, 23, 59, 59));

    return { start, end };
  };

  // For preset ranges: today / last 7 / last 30
  const getPresetRange = (preset: "today" | "7d" | "30d") => {
    const now = new Date();

    // End of today
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    let startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    if (preset === "7d") {
      // last 7 days including today → 6 days back
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    }
    if (preset === "30d") {
      // last 30 days including today → 29 days back
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    }

    return {
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
    };
  };

  // ======================
  // CORE COMPUTE FUNCTION
  // (Used by A + C + F)
  // ======================
  const computeFromOrders = (orders: OrderDoc[], label: string) => {
    let totalRevenue = 0;
    const orderCount = orders.length;

    const entreeMap = new Map<string, number>();
    const mainsMap = new Map<string, number>();
    const dessertsMap = new Map<string, number>();

    orders.forEach((o) => {
      if (typeof o.totalAmount === "number") {
        totalRevenue += o.totalAmount;
      }

      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const sel = item.selections || {};

          const bump = (map: Map<string, number>, arr?: string[]) => {
            if (!Array.isArray(arr)) return;
            arr.forEach((name) => {
              map.set(name, (map.get(name) || 0) + 1);
            });
          };

          bump(entreeMap, sel.entrees);
          bump(mainsMap, sel.mains);
          bump(dessertsMap, sel.desserts);
        });
      }
    });

    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const mapToArray = (map: Map<string, number>): PopularItem[] =>
      Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    setSummary({
      label,
      totalRevenue,
      orderCount,
      avgOrderValue,
    });

    setPopular({
      entrees: mapToArray(entreeMap),
      mains: mapToArray(mainsMap),
      desserts: mapToArray(dessertsMap),
    });
  };

  // ======================
  // PRESET SUMMARY (A)
  // ======================
  const runPresetSummary = async (preset: "today" | "7d" | "30d") => {
    setLoadingSummary(true);
    try {
      const { start, end } = getPresetRange(preset);

      const qRef = query(
        collection(db, "orders"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );

      const snap = await getDocs(qRef);
      const orders: OrderDoc[] = [];
      snap.forEach((d) => orders.push({ id: d.id, ...(d.data() as any) }));

      const label =
        preset === "today"
          ? "Today"
          : preset === "7d"
          ? "Last 7 Days"
          : "Last 30 Days";

      computeFromOrders(orders, label);
    } catch (err) {
      console.error(err);
      alert("Failed to load sales summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ======================
  // CUSTOM DATE RANGE REPORT (F)
  // ======================
  const runCustomRangeReport = async () => {
    if (!customStart || !customEnd) {
      alert("Please choose both start and end dates.");
      return;
    }

    setLoadingSummary(true);
    try {
      const { start, end } = makeRangeFromStrings(customStart, customEnd);

      const qRef = query(
        collection(db, "orders"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );

      const snap = await getDocs(qRef);
      const orders: OrderDoc[] = [];
      snap.forEach((d) => orders.push({ id: d.id, ...(d.data() as any) }));

      const label = `${customStart} → ${customEnd}`;
      computeFromOrders(orders, label);
    } catch (err) {
      console.error(err);
      alert("Failed to load custom range report.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ======================
  // MESSAGES REPORT (H)
  // ======================
  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const qRef = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const snap = await getDocs(qRef);
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));

      setMessages(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <AdminRoute>
      <div className="p-10 space-y-10">
        <h1 className="text-3xl font-bold mb-2">Business Reports</h1>
        <p className="text-gray-600 mb-4">
          View sales performance, popular items and customer messages.
        </p>

        {/* ======================================= */}
        {/* SECTION A – SALES SUMMARY (PRESET)      */}
        {/* ======================================= */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Sales Summary (Quick Filters)
          </h2>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => runPresetSummary("today")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              disabled={loadingSummary}
            >
              Today
            </button>
            <button
              onClick={() => runPresetSummary("7d")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              disabled={loadingSummary}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => runPresetSummary("30d")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              disabled={loadingSummary}
            >
              Last 30 Days
            </button>
          </div>

          {loadingSummary && <p>Loading summary...</p>}

          {summary && !loadingSummary && (
            <>
              <p className="text-gray-700 mb-4">
                Showing results for:{" "}
                <span className="font-semibold">{summary.label}</span>
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Total Revenue
                  </h3>
                  <p className="text-2xl font-bold">
                    ${summary.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Number of Orders
                  </h3>
                  <p className="text-2xl font-bold">
                    {summary.orderCount}
                  </p>
                </div>
                <div className="border rounded p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Avg. Order Value
                  </h3>
                  <p className="text-2xl font-bold">
                    ${summary.avgOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ======================================= */}
        {/* SECTION F – CUSTOM DATE RANGE REPORT    */}
        {/* ======================================= */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Custom Date Range Report
          </h2>

          <div className="grid md:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label className="block font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="border rounded p-2 w-full"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                End Date
              </label>
              <input
                type="date"
                className="border rounded p-2 w-full"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
            <div>
              <button
                onClick={runCustomRangeReport}
                className="bg-blue-600 text-white px-4 py-3 rounded w-full hover:bg-blue-700"
                disabled={loadingSummary}
              >
                Run Date Range Report
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            This uses the same calculations as the quick summary, but for the
            exact date range you choose.
          </p>
        </section>

        {/* ======================================= */}
        {/* SECTION C – POPULAR ITEMS              */}
        {/* ======================================= */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Popular Items (Current Range)
          </h2>

          {!popular && (
            <p className="text-gray-500">
              Run any Sales Summary or Date Range report above to see popular
              items here.
            </p>
          )}

          {popular && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Entrees */}
              <div>
                <h3 className="font-semibold mb-2">Top Entrees</h3>
                {popular.entrees.length === 0 && (
                  <p className="text-gray-500 text-sm">No data.</p>
                )}
                <ul className="space-y-1 text-sm">
                  {popular.entrees.map((e) => (
                    <li key={e.name}>
                      {e.name} — <span className="font-semibold">{e.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mains */}
              <div>
                <h3 className="font-semibold mb-2">Top Mains</h3>
                {popular.mains.length === 0 && (
                  <p className="text-gray-500 text-sm">No data.</p>
                )}
                <ul className="space-y-1 text-sm">
                  {popular.mains.map((m) => (
                    <li key={m.name}>
                      {m.name} — <span className="font-semibold">{m.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desserts */}
              <div>
                <h3 className="font-semibold mb-2">Top Desserts</h3>
                {popular.desserts.length === 0 && (
                  <p className="text-gray-500 text-sm">No data.</p>
                )}
                <ul className="space-y-1 text-sm">
                  {popular.desserts.map((d) => (
                    <li key={d.name}>
                      {d.name} — <span className="font-semibold">{d.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* ======================================= */}
        {/* SECTION H – CUSTOMER MESSAGES          */}
        {/* ======================================= */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Customer Messages (Last 20)
          </h2>

          <button
            onClick={loadMessages}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-4"
            disabled={loadingMessages}
          >
            {loadingMessages ? "Loading..." : "Load Messages"}
          </button>

          {messages.length === 0 && !loadingMessages && (
            <p className="text-gray-500">No messages loaded yet.</p>
          )}

          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className="border rounded p-4 bg-gray-50 text-sm"
              >
                <h3 className="font-semibold text-lg mb-1">
                  {m.name || "Unknown Sender"}
                </h3>
                <p>
                  <strong>Email:</strong> {m.email}
                </p>
                {m.subject && (
                  <p>
                    <strong>Subject:</strong> {m.subject}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-line">{m.message}</p>
                {m.createdAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sent: {m.createdAt.toDate().toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}
