"use client";

import { useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { app } from "@/lib/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";

// ----------------------------
// TYPES
// ----------------------------
type OrderItem = {
  name: string;
  guests: number;
  price: number;
  selections: {
    entrees?: string[];
    mains?: string[];
    desserts?: string[];
  };
};

type OrderDoc = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  createdAt?: any;
  totalAmount: number;
  items: OrderItem[];
};

type UserDoc = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt?: any;
};

export default function ViewOrders() {
  const db = getFirestore(app);

  // ----------------------------
  // ORDER SEARCH INPUTS
  // ----------------------------
  const [orderDate, setOrderDate] = useState("");
  const [packageType, setPackageType] = useState("any");

  const [orderFirstName, setOrderFirstName] = useState("");
  const [orderLastName, setOrderLastName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [guestsFilter, setGuestsFilter] = useState("");
  const [guestsMode, setGuestsMode] = useState<"exact" | "min">("exact");

  // ----------------------------
  // USER SEARCH INPUTS
  // ----------------------------
  const [userDate, setUserDate] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ----------------------------
  // RESULT STATES
  // ----------------------------
  const [orderResults, setOrderResults] = useState<OrderDoc[]>([]);
  const [userResults, setUserResults] = useState<UserDoc[]>([]);
  const [allOrders, setAllOrders] = useState<OrderDoc[]>([]);
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);

  // Convert date → Firestore timestamp range
  const dateRange = (d: string) => ({
    start: Timestamp.fromDate(new Date(d + "T00:00:00")),
    end: Timestamp.fromDate(new Date(d + "T23:59:59")),
  });

  // ===========================================================
  // 🔍 ORDER QUERY (Date + FirstName + LastName + Phone + Guests + Package)
  // ===========================================================
  const runOrderQuery = async () => {
    const conditions: any[] = [];

    if (orderDate) {
      const { start, end } = dateRange(orderDate);
      conditions.push(where("createdAt", ">=", start));
      conditions.push(where("createdAt", "<=", end));
    }

    if (orderFirstName.trim()) {
      conditions.push(where("firstName", "==", orderFirstName.trim()));
    }

    if (orderLastName.trim()) {
      conditions.push(where("lastName", "==", orderLastName.trim()));
    }

    if (orderPhone.trim()) {
      conditions.push(where("phone", "==", orderPhone.trim()));
    }

    if (packageType !== "any") {
      const pkg =
        packageType === "standard"
          ? "Standard Menu Package"
          : packageType === "premium"
          ? "Premium Menu Package"
          : "Deluxe Menu Package";

      conditions.push(where("items.0.name", "==", pkg));
    }

    const qRef =
      conditions.length > 0
        ? query(collection(db, "orders"), ...conditions)
        : collection(db, "orders");

    const snap = await getDocs(qRef);
    let results: OrderDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    // Guests filter (manual)
    if (guestsFilter.trim()) {
      const guestsNum = Number(guestsFilter);

      results = results
        .map((o) => ({
          ...o,
          totalGuests: o.items.reduce(
            (sum, item) => sum + (item.guests || 0),
            0
          ),
        }))
        .filter((o) =>
          guestsMode === "exact"
            ? o.totalGuests === guestsNum
            : o.totalGuests >= guestsNum
        );
    }

    setOrderResults(results);
  };

  // ===========================================================
  // 🔍 USER QUERY (Date + FirstName + LastName + Phone + Email)
  // ===========================================================
  const runUserQuery = async () => {
    const conditions: any[] = [];

    if (userDate) {
      const { start, end } = dateRange(userDate);
      conditions.push(where("createdAt", ">=", start));
      conditions.push(where("createdAt", "<=", end));
    }

    if (userFirstName.trim()) {
      conditions.push(where("firstName", "==", userFirstName.trim()));
    }

    if (userLastName.trim()) {
      conditions.push(where("lastName", "==", userLastName.trim()));
    }

    if (userPhone.trim()) {
      conditions.push(where("phone", "==", userPhone.trim()));
    }

    if (userEmail.trim()) {
      conditions.push(where("email", "==", userEmail.trim()));
    }

    const qRef =
      conditions.length > 0
        ? query(collection(db, "users"), ...conditions)
        : collection(db, "users");

    const snap = await getDocs(qRef);

    const results: UserDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    setUserResults(results);
  };

  // ===========================================================
  // 📦 LOAD ALL ORDERS
  // ===========================================================
  const fetchAllOrders = async () => {
    const qRef = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(qRef);

    setAllOrders(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    );
  };

  // ===========================================================
  // 👥 LOAD ALL USERS
  // ===========================================================
  const fetchAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));

    setAllUsers(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    );
  };

  // ===========================================================
  // UI START
  // ===========================================================
  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-10">
          Admin Database Queries
        </h1>

        {/* -------------------------------- */}
        {/* ORDER QUERY UI */}
        {/* -------------------------------- */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            Order Query
          </h2>

          {/* Inputs */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Package</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="any">Any</option>
                <option value="standard">Standard Menu Package</option>
                <option value="premium">Premium Menu Package</option>
                <option value="deluxe">Deluxe Menu Package</option>
              </select>
            </div>

            <div>
              <label>First Name</label>
              <input
                type="text"
                value={orderFirstName}
                onChange={(e) => setOrderFirstName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={orderLastName}
                onChange={(e) => setOrderLastName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label>Phone</label>
              <input
                type="text"
                value={orderPhone}
                onChange={(e) => setOrderPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Number of Guests</label>
              <input
                type="number"
                value={guestsFilter}
                onChange={(e) => setGuestsFilter(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Guests Filter Mode</label>
              <select
                value={guestsMode}
                onChange={(e) =>
                  setGuestsMode(e.target.value as "exact" | "min")
                }
                className="border p-2 rounded w-full"
              >
                <option value="exact">Exact</option>
                <option value="min">Minimum</option>
              </select>
            </div>
          </div>

          <button
            onClick={runOrderQuery}
            className="bg-red-600 text-white px-6 py-3 rounded"
          >
            Run Order Query
          </button>

          {/* Results */}
          {orderResults.map((o) => (
            <div
              key={o.id}
              className="border p-4 mt-4 rounded bg-gray-50"
            >
              <h3 className="font-bold text-xl">
                {o.firstName} {o.lastName} — ${o.totalAmount}
              </h3>
              <p>
                <strong>Phone:</strong> {o.phone}
              </p>
              <p>
                <strong>Address:</strong> {o.address}
              </p>

              {o.items.map((item, i) => (
                <div key={i} className="mt-2 ml-4">
                  <strong>{item.name}</strong> — {item.guests} guests — $
                  {item.price * item.guests}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* -------------------------------- */}
        {/* USER QUERY UI */}
        {/* -------------------------------- */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            User Registration Query
          </h2>

          {/* Inputs */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={userDate}
                onChange={(e) => setUserDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>First Name</label>
              <input
                type="text"
                value={userFirstName}
                onChange={(e) => setUserFirstName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={userLastName}
                onChange={(e) => setUserLastName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <button
            onClick={runUserQuery}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Run User Query
          </button>

          {userResults.map((u) => (
            <div
              key={u.id}
              className="border p-4 mt-4 rounded bg-gray-50"
            >
              <h3 className="text-xl font-bold">
                {u.firstName} {u.lastName}
              </h3>
              <p>
                <strong>Email:</strong> {u.email}
              </p>
              <p>
                <strong>Phone:</strong> {u.phone}
              </p>
              <p>
                <strong>ID:</strong> {u.id}
              </p>
            </div>
          ))}
        </div>

        {/* -------------------------- */}
        {/* VIEW ALL ORDERS */}
        {/* -------------------------- */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            View All Orders
          </h2>

          <button
            onClick={fetchAllOrders}
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Load All Orders
          </button>

          {allOrders.map((o) => (
            <div
              key={o.id}
              className="border p-4 mt-4 rounded bg-gray-50"
            >
              <h3 className="text-xl font-bold">
                {o.firstName} {o.lastName} — ${o.totalAmount}
              </h3>
              <p>
                <strong>Phone:</strong> {o.phone}
              </p>
            </div>
          ))}
        </div>

        {/* -------------------------- */}
        {/* VIEW ALL USERS */}
        {/* -------------------------- */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            View All Users
          </h2>

          <button
            onClick={fetchAllUsers}
            className="bg-purple-600 text-white px-6 py-3 rounded"
          >
            Load All Users
          </button>

          {allUsers.map((u) => (
            <div
              key={u.id}
              className="border p-4 mt-4 rounded bg-gray-50"
            >
              <h3 className="text-xl font-bold">
                {u.firstName} {u.lastName}
              </h3>
              <p>
                <strong>Email:</strong> {u.email}
              </p>
              <p>
                <strong>Phone:</strong> {u.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}
