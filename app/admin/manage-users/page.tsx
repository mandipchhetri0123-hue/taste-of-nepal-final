"use client";

import { useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const mainAdmin = "mandipchhetri0123@gmail.com";

  const searchUsers = async () => {
    setLoading(true);
    setUsers([]);

    const value = search.trim().toLowerCase();
    const usersRef = collection(db, "users");

    const snapshot = await getDocs(usersRef);
    const results: any[] = [];

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      const first = data.firstName?.toLowerCase() || "";
      const last = data.lastName?.toLowerCase() || "";
      const email = data.email?.toLowerCase() || "";

      // Create full name variations
      const fullName1 = `${first} ${last}`;         // mandip chhetri
      const fullName2 = `${last} ${first}`;         // chhetri mandip

      // MATCH LOGIC:
      // 1) firstName only
      // 2) fullName (first + last)
      // 3) email
      if (
        first.includes(value) ||
        fullName1.includes(value) ||
        fullName2.includes(value) ||
        email.includes(value)
      ) {
        results.push({ id: docItem.id, ...data });
      }
    });

    setUsers(results);
    setLoading(false);
  };

  const makeAdmin = async (userId: string) => {
    await updateDoc(doc(db, "users", userId), { role: "admin" });
    alert("User role updated to ADMIN!");
    searchUsers();
  };

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-8">Manage Users</h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by first name, full name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded w-full"
          />
          <button
            onClick={searchUsers}
            className="px-5 py-3 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>

        {loading && <p>Searching...</p>}

        {/* Results */}
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border p-6 bg-white rounded shadow-md flex justify-between"
            >
              <div>
                <p className="font-bold text-xl">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-700">{user.email}</p>
                <p className="text-sm mt-1">
                  Current Role:{" "}
                  <span className="font-semibold text-green-700">
                    {user.role}
                  </span>
                </p>
              </div>

              <div className="flex items-center">
                {user.email === mainAdmin ? (
                  <p className="px-4 py-2 bg-gray-300 rounded text-gray-700">
                    Main Admin (Locked)
                  </p>
                ) : (
                  <button
                    onClick={() => makeAdmin(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Make Admin
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && users.length === 0 && (
            <p className="text-gray-600">No users found.</p>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
