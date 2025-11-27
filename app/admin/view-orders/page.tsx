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

// =========================================
// TYPES
// =========================================
type OrderItem = {
  name: string;
  guests: number;
  price: number;
  selections?: {
    entrees?: string[];
    mains?: string[];
    desserts?: string[];
    specialRequest?: string;
  };
};

type OrderDoc = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt?: any;
};

type UserDoc = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender?: string;
  dob?: string;
  role?: string;
  createdAt?: any;
};

export default function AdminDatabase() {
  const db = getFirestore(app);

  // ORDER QUERY
  const [orderDate, setOrderDate] = useState("");
  const [orderFirstName, setOrderFirstName] = useState("");
  const [orderLastName, setOrderLastName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [packageType, setPackageType] = useState("any");
  const [guestsFilter, setGuestsFilter] = useState("");
  const [guestsMode, setGuestsMode] = useState<"exact" | "min">("exact");

  // USER QUERY
  const [userDate, setUserDate] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // RESULT STATES
  const [orderResults, setOrderResults] = useState<OrderDoc[]>([]);
  const [userResults, setUserResults] = useState<UserDoc[]>([]);
  const [allOrders, setAllOrders] = useState<OrderDoc[]>([]);
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);

  // Date range helper
  const dateRange = (d: string) => ({
    start: Timestamp.fromDate(new Date(d + "T00:00:00")),
    end: Timestamp.fromDate(new Date(d + "T23:59:59")),
  });

  // ===========================================================
  // 🔍 ORDER QUERY (no composite index required)
  // ===========================================================
  const runOrderQuery = async () => {
    let baseRef = collection(db, "orders");
    let q: any = baseRef;

    // Choose ONE main Firestore filter to avoid composite index:
    if (orderDate) {
      const { start, end } = dateRange(orderDate);
      q = query(baseRef, where("createdAt", ">=", start), where("createdAt", "<=", end));
    } else if (orderPhone.trim()) {
      q = query(baseRef, where("phone", "==", orderPhone.trim()));
    } else if (orderFirstName.trim()) {
      q = query(baseRef, where("firstName", "==", orderFirstName.trim()));
    } else if (orderLastName.trim()) {
      q = query(baseRef, where("lastName", "==", orderLastName.trim()));
    } else if (packageType !== "any") {
      const pkg =
        packageType === "standard"
          ? "Standard Menu Package"
          : packageType === "premium"
          ? "Premium Menu Package"
          : "Deluxe Menu Package";
      q = query(baseRef, where("items.0.name", "==", pkg));
    } else {
      q = baseRef; // no Firestore filter, filter everything client-side
    }

    const snap = await getDocs(q);

    let results: OrderDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    // Now apply ALL filters combined in memory

    // Date filter (if not already handled, but safe to re-check)
    if (orderDate) {
      const { start, end } = dateRange(orderDate);
      results = results.filter((o) => {
        if (!o.createdAt) return false;
        const ts: Timestamp = o.createdAt;
        return ts.toMillis() >= start.toMillis() && ts.toMillis() <= end.toMillis();
      });
    }

    if (orderFirstName.trim()) {
      const needle = orderFirstName.trim();
      results = results.filter((o) => o.firstName === needle);
    }

    if (orderLastName.trim()) {
      const needle = orderLastName.trim();
      results = results.filter((o) => o.lastName === needle);
    }

    if (orderPhone.trim()) {
      const needle = orderPhone.trim();
      results = results.filter((o) => o.phone === needle);
    }

    if (packageType !== "any") {
      const pkg =
        packageType === "standard"
          ? "Standard Menu Package"
          : packageType === "premium"
          ? "Premium Menu Package"
          : "Deluxe Menu Package";

      results = results.filter(
        (o) => o.items && o.items[0] && o.items[0].name === pkg
      );
    }

    // Guests filter (already client-side in your original code)
    if (guestsFilter.trim()) {
      const guestsNum = Number(guestsFilter);

      results = results
        .map((o) => ({
          ...o,
          totalGuests: o.items?.reduce(
            (s: number, i: OrderItem) => s + (i.guests || 0),
            0
          ),
        }))
        .filter((o: any) =>
          guestsMode === "exact"
            ? o.totalGuests === guestsNum
            : o.totalGuests >= guestsNum
        );
    }

    setOrderResults(results);
  };

  // ===========================================================
  // 🔄 RESET ORDER FILTERS
  // ===========================================================
  const resetOrderFilters = () => {
    setOrderDate("");
    setOrderFirstName("");
    setOrderLastName("");
    setOrderPhone("");
    setPackageType("any");
    setGuestsFilter("");
    setGuestsMode("exact");
    setOrderResults([]);
  };

  // ===========================================================
  // 🔍 USER REGISTRATION QUERY (no composite index required)
  // ===========================================================
  const runUserQuery = async () => {
    let baseRef = collection(db, "users");
    let q: any = baseRef;

    // Choose ONE main Firestore filter:
    if (userDate) {
      const { start, end } = dateRange(userDate);
      q = query(baseRef, where("createdAt", ">=", start), where("createdAt", "<=", end));
    } else if (userPhone.trim()) {
      q = query(baseRef, where("phone", "==", userPhone.trim()));
    } else if (userEmail.trim()) {
      q = query(baseRef, where("email", "==", userEmail.trim()));
    } else if (userFirstName.trim()) {
      q = query(baseRef, where("firstName", "==", userFirstName.trim()));
    } else if (userLastName.trim()) {
      q = query(baseRef, where("lastName", "==", userLastName.trim()));
    } else {
      q = baseRef;
    }

    const snap = await getDocs(q);

    let results: UserDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    // Apply combined filters client-side
    if (userDate) {
      const { start, end } = dateRange(userDate);
      results = results.filter((u) => {
        if (!u.createdAt) return false;
        const ts: Timestamp = u.createdAt;
        return ts.toMillis() >= start.toMillis() && ts.toMillis() <= end.toMillis();
      });
    }

    if (userFirstName.trim()) {
      const needle = userFirstName.trim();
      results = results.filter((u) => u.firstName === needle);
    }

    if (userLastName.trim()) {
      const needle = userLastName.trim();
      results = results.filter((u) => u.lastName === needle);
    }

    if (userPhone.trim()) {
      const needle = userPhone.trim();
      results = results.filter((u) => u.phone === needle);
    }

    if (userEmail.trim()) {
      const needle = userEmail.trim();
      results = results.filter((u) => u.email === needle);
    }

    setUserResults(results);
  };

  // ===========================================================
  // 🔄 RESET USER FILTERS
  // ===========================================================
  const resetUserFilters = () => {
    setUserDate("");
    setUserFirstName("");
    setUserLastName("");
    setUserPhone("");
    setUserEmail("");
    setUserResults([]);
  };

  // ===========================================================
  // 📦 LOAD ALL ORDERS
  // ===========================================================
  const fetchAllOrders = async () => {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );
    setAllOrders(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrderDoc[]
    );
  };

  // ===========================================================
  // 👥 LOAD ALL USERS
  // ===========================================================
  const fetchAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setAllUsers(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserDoc[]
    );
  };

  // Helper to render selections (entrees/mains/desserts)
  const renderSelections = (item: OrderItem) => {
    const sels = item.selections || {};
    const hasEntrees = (sels.entrees?.length || 0) > 0;
    const hasMains = (sels.mains?.length || 0) > 0;
    const hasDesserts = (sels.desserts?.length || 0) > 0;
    const hasSpecial = !!sels.specialRequest;

    if (!hasEntrees && !hasMains && !hasDesserts && !hasSpecial) return null;

    return (
      <div className="ml-8 mt-1 text-sm text-gray-700">
        {hasEntrees && (
          <p>
            <strong>Entrees:</strong> {sels.entrees!.join(", ")}
          </p>
        )}
        {hasMains && (
          <p>
            <strong>Mains:</strong> {sels.mains!.join(", ")}
          </p>
        )}
        {hasDesserts && (
          <p>
            <strong>Desserts:</strong> {sels.desserts!.join(", ")}
          </p>
        )}
        {hasSpecial && (
          <p>
            <strong>Special Request:</strong> {sels.specialRequest}
          </p>
        )}
      </div>
    );
  };

  // ===========================================================
  // UI START
  // ===========================================================
  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-10">Admin Database Queries</h1>

        {/* ---------------------------------------- */}
        {/* ORDER QUERY SECTION */}
        {/* ---------------------------------------- */}
        <div className="bg-white p-6 rounded shadow mb-14">
          <h2 className="text-2xl font-semibold mb-6">Order Query</h2>

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
              <label>Guest Filter Mode</label>
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
          <button
            onClick={resetOrderFilters}
            className="bg-gray-600 text-white px-6 py-3 rounded ml-4"
          >
            Reset Filters
          </button>

          {/* ORDER RESULTS */}
          {orderResults.map((o: any) => {
            const totalGuests =
              o.items?.reduce(
                (s: number, i: OrderItem) => s + (i.guests || 0),
                0
              ) ?? 0;

            return (
              <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
                <h3 className="font-bold text-xl">
                  {o.firstName} {o.lastName} — ${o.totalAmount}
                </h3>
                <p>
                  <strong>Email:</strong> {o.email}
                </p>
                <p>
                  <strong>Phone:</strong> {o.phone}
                </p>
                <p>
                  <strong>Address:</strong> {o.address}
                </p>
                <p>
                  <strong>Total Guests:</strong> {totalGuests}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {o.createdAt?.toDate()?.toLocaleString()}
                </p>

                <p className="mt-2 font-semibold underline">Items:</p>
                {o.items?.map((item: OrderItem, i: number) => (
                  <div key={i} className="ml-4 mt-1">
                    <p>
                      {item.name} — {item.guests} guests — $
                      {item.price * item.guests}
                    </p>
                    {renderSelections(item)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* ===================================== */}
        {/* USER REGISTRATION QUERY SECTION */}
        {/* ===================================== */}
        <div className="bg-white p-6 rounded shadow mb-14">
          <h2 className="text-2xl font-semibold mb-6">
            User Registration Query
          </h2>

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
          <button
            onClick={resetUserFilters}
            className="bg-gray-600 text-white px-6 py-3 rounded ml-4"
          >
            Reset Filters
          </button>

          {/* USER RESULTS */}
          {userResults.map((u) => (
            <div key={u.id} className="border p-4 mt-4 rounded bg-gray-50">
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
                <strong>Gender:</strong> {u.gender}
              </p>
              <p>
                <strong>Date of Birth:</strong> {u.dob}
              </p>
              <p>
                <strong>Role:</strong> {u.role}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {u.createdAt?.toDate()?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* ---------------------------------------- */}
        {/* VIEW ALL ORDERS (FULL DETAILS) */}
        {/* ---------------------------------------- */}
        <div className="bg-white p-6 rounded shadow mb-14">
          <h2 className="text-2xl font-semibold mb-4">View All Orders</h2>

          <button
            onClick={fetchAllOrders}
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Load All Orders
          </button>

          {allOrders.map((o: any) => {
            const totalGuests =
              o.items?.reduce(
                (s: number, i: OrderItem) => s + (i.guests || 0),
                0
              ) ?? 0;

            return (
              <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
                <h3 className="text-xl font-bold">
                  {o.firstName} {o.lastName} — ${o.totalAmount}
                </h3>

                <p>
                  <strong>Email:</strong> {o.email}
                </p>
                <p>
                  <strong>Phone:</strong> {o.phone}
                </p>
                <p>
                  <strong>Address:</strong> {o.address}
                </p>
                <p>
                  <strong>Total Guests:</strong> {totalGuests}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {o.createdAt?.toDate()?.toLocaleString()}
                </p>

                <p className="mt-2 font-semibold underline">Items:</p>
                {o.items?.map((item: OrderItem, i: number) => (
                  <div key={i} className="ml-4 mt-1">
                    <p>
                      {item.name} — {item.guests} guests — $
                      {item.price * item.guests}
                    </p>
                    {renderSelections(item)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------- */}
        {/* VIEW ALL USERS (FULL DETAILS) */}
        {/* ---------------------------------------- */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">View All Users</h2>

          <button
            onClick={fetchAllUsers}
            className="bg-purple-600 text-white px-6 py-3 rounded"
          >
            Load All Users
          </button>

          {allUsers.map((u) => (
            <div key={u.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="font-bold text-xl">
                {u.firstName} {u.lastName}
              </h3>

              <p>
                <strong>Email:</strong> {u.email}
              </p>
              <p>
                <strong>Phone:</strong> {u.phone}
              </p>
              <p>
                <strong>Gender:</strong> {u.gender}
              </p>
              <p>
                <strong>Date of Birth:</strong> {u.dob}
              </p>
              <p>
                <strong>Role:</strong> {u.role}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {u.createdAt?.toDate()?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}
