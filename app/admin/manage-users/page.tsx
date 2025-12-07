"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const mainAdmin = "mandipchhetri0123@gmail.com";

  // Load logged-in email to verify if user is Mandip
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(app), (u) => {
      if (u) setCurrentUserEmail(u.email || "");
    });
    return () => unsub();
  }, []);

  // Load all users on page load
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const allUsers: any[] = [];
    snapshot.forEach((docItem) => {
      allUsers.push({ id: docItem.id, ...docItem.data() });
    });

    setUsers(allUsers);
    setFilteredUsers(allUsers);
    setLoading(false);
  };

  // Search function
  const searchUsers = () => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredUsers(users);
      return;
    }

    const results = users.filter((user) => {
      const first = user.firstName?.toLowerCase() || "";
      const last = user.lastName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";

      const full1 = `${first} ${last}`;
      const full2 = `${last} ${first}`;

      return (
        first.includes(value) ||
        email.includes(value) ||
        full1.includes(value) ||
        full2.includes(value)
      );
    });

    setFilteredUsers(results);
  };

  // Update role admin <-> customer
  const updateRole = async (userId: string, newRole: string) => {
    if (currentUserEmail !== mainAdmin) {
      alert("You do not have permission to change roles.");
      return;
    }

    await updateDoc(doc(db, "users", userId), { role: newRole });
    alert(`Role updated to ${newRole.toUpperCase()}!`);
    loadAllUsers();
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
            onChange={(e) => {
              setSearch(e.target.value);
              searchUsers(); // live filter
            }}
            className="border p-3 rounded w-full"
          />
          <button
            onClick={searchUsers}
            className="px-5 py-3 bg-blue-600 text-white rounded"
          >
            Search
          </button>
        </div>

        {loading && <p>Loading users...</p>}

        <div className="space-y-4">
          {filteredUsers.map((user) => (
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
                  Role:{" "}
                  <span className="font-semibold text-green-700">
                    {user.role}
                  </span>
                </p>
              </div>

              <div className="flex items-center">
                {/* LOCK MASTER ADMIN */}
                {user.email === mainAdmin ? (
                  <p className="px-4 py-2 bg-gray-300 rounded text-gray-700">
                    Main Admin (Locked)
                  </p>
                ) : currentUserEmail !== mainAdmin ? (
                  /* EXTRA SECURITY: hide buttons if viewer is not Mandip */
                  <p className="px-4 py-2 bg-gray-200 rounded text-gray-600">
                    No Permission
                  </p>
                ) : user.role === "admin" ? (
                  <button
                    onClick={() => updateRole(user.id, "customer")}
                    className="px-4 py-2 bg-yellow-600 text-white rounded"
                  >
                    Make Customer
                  </button>
                ) : (
                  <button
                    onClick={() => updateRole(user.id, "admin")}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Make Admin
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && filteredUsers.length === 0 && (
            <p className="text-gray-600">No users found.</p>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
