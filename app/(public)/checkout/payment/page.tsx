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

// TYPES
type OrderItem = {
  name: string;
  guests: number;
  price: number;
};

type OrderDoc = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  packageName: string;
  status: string;
  totalGuests: number;
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

  // ORDER SEARCH INPUTS
  const [orderDate, setOrderDate] = useState("");
  const [orderFirstName, setOrderFirstName] = useState("");
  const [orderLastName, setOrderLastName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [packageType, setPackageType] = useState("any");

  // USERS SEARCH INPUTS
  const [userDate, setUserDate] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // RESULTS
  const [orderResults, setOrderResults] = useState<OrderDoc[]>([]);
  const [allOrders, setAllOrders] = useState<OrderDoc[]>([]);
  const [userResults, setUserResults] = useState<UserDoc[]>([]);
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);

  const dateRange = (d: string) => ({
    start: Timestamp.fromDate(new Date(d + "T00:00:00")),
    end: Timestamp.fromDate(new Date(d + "T23:59:59")),
  });

  // ------------------------------
  // RUN ORDER QUERY
  // ------------------------------
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
      conditions.push(where("packageName", "==", packageType));
    }

    const qRef =
      conditions.length > 0
        ? query(collection(db, "orders"), ...conditions)
        : collection(db, "orders");

    const snap = await getDocs(qRef);
    setOrderResults(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    );
  };

  // ------------------------------
  // RUN USER QUERY
  // ------------------------------
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
    setUserResults(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  // ------------------------------
  // LOAD ALL ORDERS
  // ------------------------------
  const fetchAllOrders = async () => {
    const snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc"))
    );

    setAllOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  // ------------------------------
  // LOAD ALL USERS
  // ------------------------------
  const fetchAllUsers = async () => {
    const snap = await getDocs(collection(db, "users"));

    setAllUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-10">Admin Database Queries</h1>

        {/* ORDER QUERY */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">Order Query</h2>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="border p-2 rounded w-full" />

            <select value={packageType} onChange={(e) => setPackageType(e.target.value)} className="border p-2 rounded w-full">
              <option value="any">Any</option>
              <option value="Standard Menu Package">Standard Menu Package</option>
              <option value="Premium Menu Package">Premium Menu Package</option>
              <option value="Deluxe Menu Package">Deluxe Menu Package</option>
            </select>

            <input type="text" placeholder="First Name" value={orderFirstName} onChange={(e) => setOrderFirstName(e.target.value)} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Last Name" value={orderLastName} onChange={(e) => setOrderLastName(e.target.value)} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Phone" value={orderPhone} onChange={(e) => setOrderPhone(e.target.value)} className="border p-2 rounded w-full" />
          </div>

          <button onClick={runOrderQuery} className="bg-red-600 text-white px-6 py-3 rounded">
            Run Order Query
          </button>

          {orderResults.map((o) => (
            <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="text-xl font-bold">{o.fullName} — ${o.totalAmount}</h3>
              <p><strong>Phone:</strong> {o.phone}</p>
              <p><strong>Email:</strong> {o.email}</p>
              <p><strong>Address:</strong> {o.address}</p>
              <p><strong>Package:</strong> {o.packageName}</p>
              <p><strong>Total Guests:</strong> {o.totalGuests}</p>
              <p><strong>Status:</strong> {o.status}</p>
              <p><strong>Order ID:</strong> {o.id}</p>
              <p><strong>Created:</strong> {o.createdAt?.toDate().toLocaleString()}</p>

              <h4 className="font-semibold mt-2">Items:</h4>
              {o.items.map((item, i) => (
                <div key={i} className="ml-4 mt-1">
                  <p><strong>Name:</strong> {item.name}</p>
                  <p><strong>Guests:</strong> {item.guests}</p>
                  <p><strong>Price per Guest:</strong> ${item.price}</p>
                  <p><strong>Total:</strong> ${item.price * item.guests}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* USER QUERY */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">User Registration Query</h2>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <input type="date" value={userDate} onChange={(e) => setUserDate(e.target.value)} className="border p-2 rounded w-full" />
            <input type="text" placeholder="First Name" value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Last Name" value={userLastName} onChange={(e) => setUserLastName(e.target.value)} className="border p-2 rounded w-full" />
            <input type="text" placeholder="Phone" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="border p-2 rounded w-full" />
            <input type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="border p-2 rounded w-full" />
          </div>

          <button onClick={runUserQuery} className="bg-blue-600 text-white px-6 py-3 rounded">
            Run User Query
          </button>

          {userResults.map((u) => (
            <div key={u.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="text-xl font-bold">{u.firstName} {u.lastName}</h3>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Phone:</strong> {u.phone}</p>
              <p><strong>ID:</strong> {u.id}</p>
              <p><strong>Created:</strong> {u.createdAt?.toDate().toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* VIEW ALL ORDERS */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-2xl font-semibold mb-4">View All Orders</h2>

          <button onClick={fetchAllOrders} className="bg-green-600 text-white px-6 py-3 rounded">
            Load All Orders
          </button>

          {allOrders.map((o) => (
            <div key={o.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="text-xl font-bold">{o.fullName} — ${o.totalAmount}</h3>
              <p><strong>Package:</strong> {o.packageName}</p>
              <p><strong>Guests:</strong> {o.totalGuests}</p>
              <p><strong>Phone:</strong> {o.phone}</p>
            </div>
          ))}
        </div>

        {/* VIEW ALL USERS */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">View All Users</h2>

          <button onClick={fetchAllUsers} className="bg-purple-600 text-white px-6 py-3 rounded">
            Load All Users
          </button>

          {allUsers.map((u) => (
            <div key={u.id} className="border p-4 mt-4 rounded bg-gray-50">
              <h3 className="text-xl font-bold">{u.firstName} {u.lastName}</h3>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Phone:</strong> {u.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}
