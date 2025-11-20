'use client';

import { useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { app } from "@/lib/firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";

export default function Reports() {
  const db = getFirestore(app);

  // USER REGISTRATION QUERY STATES
  const [userDate, setUserDate] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert date → timestamp range
  const makeDateRange = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const start = Timestamp.fromDate(new Date(year, month - 1, day, 0, 0, 0));
    const end = Timestamp.fromDate(new Date(year, month - 1, day, 23, 59, 59));
    return { start, end };
  };

  // RUN USER QUERY
  const runUserQuery = async () => {
    if (!userDate) return alert("Please select a date.");
    setLoading(true);
    setUserResults([]);

    const { start, end } = makeDateRange(userDate);

    const q = query(
      collection(db, "users"),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end)
    );

    const snapshot = await getDocs(q);

    const list: any[] = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

    setUserResults(list);
    setLoading(false);
  };

  return (
    <AdminRoute>
      <div className="p-10">

        {/* ---------------------------------------------- */}
        {/* USER REGISTRATIONS QUERY SECTION */}
        {/* ---------------------------------------------- */}

        <h1 className="text-3xl font-bold mb-6">User Registration Query</h1>

        <div className="flex gap-6 items-end bg-white p-6 rounded shadow mb-10">

          {/* Date Picker */}
          <div className="flex-1">
            <label className="font-semibold">Select Date</label>
            <input
              type="date"
              className="w-full border p-3 rounded mt-1"
              value={userDate}
              onChange={(e) => setUserDate(e.target.value)}
            />
          </div>

          <button
            onClick={runUserQuery}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Run Query
          </button>
        </div>

        {/* RESULTS */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-6">
            {userResults.map((u, i) => (
              <div key={i} className="border p-5 bg-white rounded shadow">
                <h2 className="text-xl font-bold">{u.fullName || "Unnamed User"}</h2>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>UID:</strong> {u.id}</p>
                <p><strong>Created At:</strong> {u.createdAt?.toDate().toLocaleString()}</p>
              </div>
            ))}

            {userResults.length === 0 && (
              <p className="text-gray-500">No users found for this date.</p>
            )}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
