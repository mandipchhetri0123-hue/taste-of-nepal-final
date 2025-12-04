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
import jsPDF from "jspdf"; // ✅ PDF EXPORT
// Normalize labels to prevent weird unicode in PDF
const normalizeLabel = (label: string) => {
  return String(label)
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Master dictionary to unify spellings / variants
const canonicalNames: Record<string, string> = {
  // Bhatmas
  "Bhatmas Sadeko": "Bhatmas Sadheko",
  "bhatmas sadeko": "Bhatmas Sadheko",
  "Bhatmas Sadheko": "Bhatmas Sadheko",
  "bhatmas sadheko": "Bhatmas Sadheko",

  // Lalmohan
  "Lamohan": "Lalmohan",
  "lamohan": "Lalmohan",
  "Lalmohan": "Lalmohan",
  "lalmohan": "Lalmohan",

  // Peanut
  "Peanut Sadeko": "Peanut Sadheko",
  "peanut sadeko": "Peanut Sadheko",
  "Peanut Sadheko": "Peanut Sadheko",
  "peanut sadheko": "Peanut Sadheko",
};

// Turn any raw item label into a single canonical display name
const canonicalizeItemName = (raw: string): string => {
  const trimmed = raw.trim();

  // Exact match first
  if (canonicalNames[trimmed]) return canonicalNames[trimmed];

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  if (canonicalNames[lower]) return canonicalNames[lower];

  // Fallback: just return a nicely trimmed version
  return trimmed;
};


// ======================
// TYPES & CONSTANTS
// ======================
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

type OrderItem = {
  name?: string;
  guests?: number;
  selections?: {
    entrees?: string[];
    mains?: string[];
    desserts?: string[];
    [key: string]: any;
  };
  [key: string]: any;
};

type StockRow = {
  name: string;
  initialStock: number;
  sold: number;
  remaining: number;
};

// Each weekly block for graph
type WeeklyBlock = {
  label: string;   // "2025-11-06 to 2025-11-12"
  revenue: number;
  orders: number;
};

// Default starting stock if no explicit initialStock field exists
const DEFAULT_INITIAL_STOCK = 1500;

export default function Reports() {
  const db = getFirestore(app);

  const [summary, setSummary] = useState<{
    label: string;
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
    weeklyBlocks?: WeeklyBlock[];
  } | null>(null);

  const [popular, setPopular] = useState<{
    entrees: PopularItem[];
    mains: PopularItem[];
    desserts: PopularItem[];
  } | null>(null);

  const [loadingSummary, setLoadingSummary] = useState(false);

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // STOCK REPORT STATE
  const [stockReport, setStockReport] = useState<StockRow[] | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  // ======================
  // DATE HANDLING
  // ======================
  const makeRangeFromStrings = (startStr: string, endStr: string) => {
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);

    const start = Timestamp.fromDate(new Date(sy, sm - 1, sd, 0, 0, 0));
    const end = Timestamp.fromDate(new Date(ey, em - 1, ed, 23, 59, 59));

    return { start, end };
  };

  const getPresetRange = (preset: "today" | "7d" | "30d") => {
    const now = new Date();

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
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    }
    if (preset === "30d") {
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    }

    return {
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
    };
  };

  // ======================
  // WEEKLY BLOCK BUILDER (7-day ranges)
  // ======================
  const buildWeeklyBlocks = (orders: OrderDoc[]): WeeklyBlock[] => {
    if (!orders.length) return [];

    // Only orders with createdAt
    const clean = orders.filter((o) => o.createdAt);
    if (!clean.length) return [];

    // Sort by createdAt
    const sorted = [...clean].sort(
      (a, b) => a.createdAt!.toMillis() - b.createdAt!.toMillis()
    );

    const startDate = new Date(sorted[0].createdAt!.toMillis());
    const endDate = new Date(sorted[sorted.length - 1].createdAt!.toMillis());

    const blocks: WeeklyBlock[] = [];

    let blockStart = new Date(startDate);
    blockStart.setHours(0, 0, 0, 0);

    while (blockStart <= endDate) {
      const blockEnd = new Date(blockStart);
      blockEnd.setDate(blockEnd.getDate() + 6); // 7-day block
      blockEnd.setHours(23, 59, 59, 999);

      const label = `${blockStart.toISOString().slice(0, 10)} to ${blockEnd
        .toISOString()
        .slice(0, 10)}`;

      let blockRevenue = 0;
      let blockOrders = 0;

      clean.forEach((o) => {
        const t = o.createdAt!.toMillis();
        if (t >= blockStart.getTime() && t <= blockEnd.getTime()) {
          blockRevenue += o.totalAmount || 0;
          blockOrders += 1;
        }
      });

      blocks.push({
        label,
        revenue: blockRevenue,
        orders: blockOrders,
      });

      // move to next 7-day block
      blockStart.setDate(blockStart.getDate() + 7);
    }

    return blocks;
  };


  // ======================
  // COMPUTATION
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

      arr.forEach((rawName) => {
        if (!rawName) return;

        // Convert any spelling into one canonical display name
        const displayName = canonicalizeItemName(rawName);

        map.set(displayName, (map.get(displayName) || 0) + 1);
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
      weeklyBlocks: buildWeeklyBlocks(orders),
    });

    setPopular({
      entrees: mapToArray(entreeMap),
      mains: mapToArray(mainsMap),
      desserts: mapToArray(dessertsMap),
    });
  };

  // ======================
  // PRESET SUMMARY
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

      computeFromOrders(orders, normalizeLabel(label));
    } catch {
      alert("Failed to load sales summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ======================
  // CUSTOM RANGE
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

      const label = normalizeLabel(`${customStart} to ${customEnd}`);
      computeFromOrders(orders, label);
    } catch {
      alert("Failed to load custom range report.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ======================
  // MESSAGES
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
    } catch {
      alert("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // ======================
  // STOCK REPORT (REAL-TIME)
  // ======================
  const loadStockReport = async () => {
    setLoadingStock(true);
    try {
      const stockSnap = await getDocs(collection(db, "foodStock"));

      const rows: StockRow[] = [];

      stockSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;

        const name: string = (data.name as string) || docSnap.id;
        if (!name) return;
        if (name.includes("Menu Package")) return; // skip packages

        const remainingRaw = data.stock;
        const remaining =
          typeof remainingRaw === "number" && !isNaN(remainingRaw)
            ? remainingRaw
            : 0;

        const initialRaw = data.initialStock;
        const initial =
          typeof initialRaw === "number" && !isNaN(initialRaw)
            ? initialRaw
            : DEFAULT_INITIAL_STOCK;

        const sold = Math.max(initial - remaining, 0);

        rows.push({
          name,
          initialStock: initial,
          sold,
          remaining,
        });
      });

      rows.sort((a, b) => a.name.localeCompare(b.name));

      setStockReport(rows);
    } catch (err) {
      console.error(err);
      alert("Failed to load stock report.");
    } finally {
      setLoadingStock(false);
    }
  };

  // ======================
  // EXPORT PDF (WITH WEEKLY GRAPH)
// ======================
  const generatePDF = () => {
    // small delay so state is fully updated (fix custom range issue)
    setTimeout(() => {
      const doc = new jsPDF();
      let y = 20;

      doc.setFont("times", "normal");

      const newPage = () => {
        doc.addPage();
        y = 20;
        doc.setFont("times", "normal");
      };

      const addSpace = (amount = 8) => {
        y += amount;
        if (y > 270) newPage();
      };

      const writeLine = (text: string, size = 12, indent = 10) => {
        doc.setFontSize(size);
        doc.text(text, indent, y);
        addSpace();
      };

      // =======================
      // HEADER (CENTERED)
      // =======================
      doc.setFontSize(22);
      const title = "Taste of Nepal - Business Report";
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleX = pageWidth / 2;
      doc.text(title, titleX, y, { align: "center" });
      addSpace(12);

      doc.setFontSize(12);
      const dateText = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(dateText, titleX, y, { align: "center" });
      addSpace(15);

      // =======================
      // SALES SUMMARY
      // =======================
      if (summary) {
        writeLine("Sales Summary", 18);
        writeLine(`Range: ${normalizeLabel(summary.label)}`, 14);
        writeLine(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
        writeLine(`Order Count: ${summary.orderCount}`);
        writeLine(`Average Order Value: $${summary.avgOrderValue.toFixed(2)}`);
        addSpace(5);

      
// =========================================================
// WEEKLY REVENUE vs ORDERS — FIXED GRAPH POSITION
// =========================================================
if (summary.weeklyBlocks && summary.weeklyBlocks.length > 0) {
  const weekly = summary.weeklyBlocks;

  addSpace(40);  // <<< THIS PUSHES GRAPH DOWN

  doc.setFontSize(16);
  doc.text(
    "Weekly Revenue vs Orders (7-Day Blocks)",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  addSpace(20);

  const graphX = 25;
  const graphY = y + 80;   // <<< START LOWER TO AVOID OVERLAP
  const graphWidth = 160;
  const graphHeight = 60;

  // Axes
  doc.line(graphX, graphY - graphHeight, graphX, graphY);
  doc.line(graphX, graphY, graphX + graphWidth, graphY);

  // Scaling
  let maxRevenue = Math.max(...weekly.map(b => b.revenue), 0);
  if (maxRevenue < 500) maxRevenue = 500;
  const yScale = graphHeight / (maxRevenue * 0.6);
  const xStep = weekly.length > 1 ? graphWidth / (weekly.length - 1) : graphWidth;

  // Y-axis labels
  doc.setFontSize(8);
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const value = (maxRevenue / ticks) * i;
    const yPos = graphY - value * yScale;

    doc.text(String(Math.round(value)), graphX - 15, yPos + 3);
    doc.line(graphX - 3, yPos, graphX, yPos);
  }

  // Plot
  doc.setFillColor(255, 0, 0);

  weekly.forEach((block, index) => {
    const px = graphX + index * xStep;
    const py = graphY - block.revenue * yScale;

    doc.circle(px, py, 2, "F");

    if (index > 0) {
      const prev = weekly[index - 1];
      const prevX = graphX + (index - 1) * xStep;
      const prevY = graphY - prev.revenue * yScale;
      doc.line(prevX, prevY, px, py);
    }

    // Orders above point
    doc.text(`(${block.orders})`, px - 5, py - 5);

    // Date labels
    doc.setFontSize(7);
    doc.text(block.label, px - 20, graphY + 12);
  });

  // Move cursor below graph
  y = graphY + 30;

  // Totals
  doc.setFontSize(12);
  doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`, 10, y);
  y += 6;
  doc.text(`Total Orders: ${summary.orderCount}`, 10, y);
  y += 15;
}


        
      }

      // =======================
      // POPULAR ITEMS
      // =======================
      if (popular) {
        writeLine("Popular Items", 18);

        writeLine("Top Entrees:", 14);
        popular.entrees.forEach((e) =>
          writeLine(`• ${e.name} (${e.count})`, 12, 18)
        );

        addSpace(5);

        writeLine("Top Mains:", 14);
        popular.mains.forEach((m) =>
          writeLine(`• ${m.name} (${m.count})`, 12, 18)
        );

        addSpace(5);

        writeLine("Top Desserts:", 14);
        popular.desserts.forEach((d) =>
          writeLine(`• ${d.name} (${d.count})`, 12, 18)
        );

        addSpace(10);
      }

      // =========================
      // STOCK REPORT TABLE
      // =========================
      if (stockReport && stockReport.length > 0) {
        writeLine("Stock Report", 18);

        doc.setFontSize(13);
        doc.text("Item", 10, y);
        doc.text("Initial", 70, y);
        doc.text("Sold", 110, y);
        doc.text("Remain", 150, y);
        addSpace(6);

        stockReport.forEach((item) => {
          doc.setFontSize(11);
          doc.text(item.name, 10, y);
          doc.text(String(item.initialStock), 70, y);
          doc.text(String(item.sold), 110, y);
          doc.text(String(item.remaining), 150, y);
          addSpace(6);
        });

        addSpace(10);
      }

      // =======================
      // CUSTOMER MESSAGES
      // =======================
      if (messages && messages.length > 0) {
        writeLine("Customer Messages", 18);

        messages.forEach((m, index) => {
          writeLine(`${index + 1}. ${m.name || "Unknown Sender"}`, 14);
          writeLine(`Email: ${m.email}`, 12, 18);

          if (m.subject) writeLine(`Subject: ${m.subject}`, 12, 18);

          const messageLines = doc.splitTextToSize(m.message, 180);
          messageLines.forEach((line: string) => {
            writeLine(line, 11, 18);
          });

          if (m.createdAt) {
            writeLine(
              `Sent: ${m.createdAt.toDate().toLocaleString()}`,
              11,
              18
            );
          }

          addSpace(6);
        });
      }

      doc.save("TasteOfNepal_BusinessReport.pdf");
    }, 150);
  };

  // ======================
  // UI
  // ======================
  return (
    <AdminRoute>
      <div className="p-10 space-y-10">
        <h1 className="text-3xl font-bold mb-2">Business Reports</h1>

        {/* PDF BUTTON */}
        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 mb-6"
        >
          Download PDF Report
        </button>

        {/* SECTION A — PRESET SUMMARY */}
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

        {/* CUSTOM DATE RANGE */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Custom Date Range Report
          </h2>

          <div className="grid md:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label className="block font-semibold mb-1">Start Date</label>
              <input
                type="date"
                className="border rounded p-2 w-full"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">End Date</label>
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
        </section>

        {/* REAL-TIME STOCK REPORT */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Real-Time Stock Report
          </h2>

          <button
            onClick={loadStockReport}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 mb-4"
            disabled={loadingStock}
          >
            {loadingStock ? "Loading..." : "Load Stock Report"}
          </button>

          {!stockReport && !loadingStock && (
            <p className="text-gray-500">No stock report loaded yet.</p>
          )}

          {stockReport && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Item</th>
                    <th className="p-2 border">Initial Stock</th>
                    <th className="p-2 border">Sold</th>
                    <th className="p-2 border">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReport.map((row) => (
                    <tr key={row.name}>
                      <td className="p-2 border">{row.name}</td>
                      <td className="p-2 border">{row.initialStock}</td>
                      <td className="p-2 border text-red-600">
                        {row.sold}
                      </td>
                      <td
                        className={`p-2 border ${
                          row.remaining < 20
                            ? "text-red-600 font-bold"
                            : "text-green-700"
                        }`}
                      >
                        {row.remaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* POPULAR ITEMS */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Popular Items (Current Range)
          </h2>

          {!popular && (
            <p className="text-gray-500">
              Run any Sales Summary or Date Range report above to see
              popular items here.
            </p>
          )}

          {popular && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Entrees */}
              <div>
                <h3 className="font-semibold mb-2">Top Entrees</h3>
                <ul className="space-y-1 text-sm">
                  {popular.entrees.map((e) => (
                    <li key={e.name}>
                      {e.name} —{" "}
                      <span className="font-semibold">{e.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mains */}
              <div>
                <h3 className="font-semibold mb-2">Top Mains</h3>
                <ul className="space-y-1 text-sm">
                  {popular.mains.map((m) => (
                    <li key={m.name}>
                      {m.name} —{" "}
                      <span className="font-semibold">{m.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desserts */}
              <div>
                <h3 className="font-semibold mb-2">Top Desserts</h3>
                <ul className="space-y-1 text-sm">
                  {popular.desserts.map((d) => (
                    <li key={d.name}>
                      {d.name} —{" "}
                      <span className="font-semibold">{d.count}</span>{" "}
                      orders
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* CUSTOMER MESSAGES */}
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
                <p className="mt-2 whitespace-pre-line">
                  {m.message}
                </p>
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
