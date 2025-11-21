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

export default function ViewOrders() {
  const db = getFirestore(app);

  const [orderResults, setOrderResults] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [orderDate, setOrderDate] = useState("");
  const [orderFirstName, setOrderFirstName] = useState("");
  const [orderLastName, setOrderLastName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");

  const dateRange = (d: string) => ({
    start: Timestamp.fromDate(new Date(d + "T00:00:00")),
    end: Timestamp.fromDate(new Date(d + "T23:59:59")),
  });

  // RUN ORDER QUERY
  const runOrderQuery = async () => {
    const conditions: any[] = [];

    if (orderDate) {
      const { start, end } = dateRange(orderDate);
      conditions.push(where("createdAt", ">=", start));
      conditions.push(where("createdAt", "<=", end));
    }
    if (orderFirstName.trim())
      conditions.push(where("firstName", "==", orderFirstName.trim()));
    if (orderLastName.trim())
      conditions.push(where("lastName", "==", orderLastName.trim()));
    if (orderPhone.trim())
      conditions.push(where("phone", "==", orderPhone.trim()));

    const snap = await getDocs(
      conditions.length > 0
        ? query(collection(db, "orders"), ...conditions)
        : collection(db, "orders")
    );

    setOrderResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // FETCH ALL ORDERS
  const fetchAllOrders = async () => {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );
    setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // FETCH ALL USERS
  const fetchAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-10">Admin Database Queries</h1>

        {/* ================= ORDER QUERY ================= */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">Search Orders</h2>

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

            <div>
              <label>Phone</label>
              <input
                type="text"
                value={orderPhone}
                onChange={(e) => setOrderPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <button
            onClick={runOrderQuery}
            className="bg-red-600 text-white px-6 py-3 rounded"
          >
            Run Order Query
          </button>

          {orderResults.map((o) => (
            <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="font-bold text-xl">
                {o.fullName} — ${o.totalAmount}
              </h3>

              <p><strong>Phone:</strong> {o.phone}</p>
              <p><strong>Email:</strong> {o.email}</p>
              <p><strong>Address:</strong> {o.address}</p>
              <p><strong>Note:</strong> {o.note}</p>
              <p><strong>Package:</strong> {o.packageName}</p>
              <p><strong>Total Guests:</strong> {o.totalGuests}</p>
              <p><strong>Status:</strong> {o.status}</p>

              <h4 className="font-semibold mt-3">Items:</h4>
              {o.items.map((item: any, i: number) => (
                <div key={i} className="ml-4 mt-2">
                  <strong>{item.name}</strong> — {item.guests} guests
                  <div className="ml-4 text-sm text-gray-700">
                    <p>• <strong>Entrees:</strong> {item.selections?.entrees?.join(", ")}</p>
                    <p>• <strong>Mains:</strong> {item.selections?.mains?.join(", ")}</p>
                    <p>• <strong>Desserts:</strong> {item.selections?.desserts?.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ================= VIEW ALL ORDERS ================= */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">View All Orders</h2>

          <button
            onClick={fetchAllOrders}
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Load All Orders
          </button>

          {allOrders.map((o) => (
            <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="font-bold text-xl">
                {o.fullName} — ${o.totalAmount}
              </h3>
              <p><strong>Phone:</strong> {o.phone}</p>
              <p><strong>Email:</strong> {o.email}</p>
              <p><strong>Package:</strong> {o.packageName}</p>
              <p><strong>Total Guests:</strong> {o.totalGuests}</p>
            </div>
          ))}
        </div>

        {/* ================= VIEW ALL USERS ================= */}
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
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Phone:</strong> {u.phone}</p>
              <p><strong>ID:</strong> {u.id}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}
