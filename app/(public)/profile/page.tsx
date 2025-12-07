"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { app } from "@/firebase/config";

// ==========================
// TYPES
// ==========================
type Address = {
  unit?: string;
  street?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
};

type UserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
};

type OrderData = {
  id: string;
  createdAt: any;
  totalAmount: number;
  totalGuests: number;
  address: string;
  status: string;
  items: any[];
};

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export default function ProfilePage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orderHistory, setOrderHistory] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ==========================
  // LOAD USER PROFILE
  // ==========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData(snap.data() as UserData);
      } else {
        setUserData({ email: user.email || "" });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ==========================
  // LOGOUT
  // ==========================
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ==========================
  // INPUT HANDLER
  // ==========================
  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setUserData((prev) =>
      prev
        ? { ...prev, address: { ...prev.address, [field]: value } }
        : prev
    );
  };

  // ==========================
  // SAVE PROFILE
  // ==========================
  const handleSave = async () => {
    if (!auth.currentUser || !userData) return;

    if (!userData.firstName?.trim() || !userData.lastName?.trim()) {
      alert("Please enter your first and last name.");
      return;
    }

    if (userData.phone && !phoneRegex.test(userData.phone.trim())) {
      alert("Enter a valid phone number (e.g. +61412345678)");
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address || {},
      });

      alert("Profile updated!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    }

    setSaving(false);
  };

  // ==========================
  // ORDER HISTORY
  // ==========================
  const loadOrderHistory = async () => {
    if (!auth.currentUser) return;

    setLoadingOrders(true);
    try {
      const qRef = query(
        collection(db, "orders"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(qRef);
      const list: OrderData[] = [];

      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));

      setOrderHistory(list);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      alert("Error loading orders.");
    }

    setLoadingOrders(false);
  };

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleDateString() + " — " + d.toLocaleTimeString();
  };

  // ==========================
  // LOADING UI
  // ==========================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">No Profile Found</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const addr = userData.address || {};

  // ==========================
  // MAIN PROFILE UI
  // ==========================
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-12">
      <h1 className="text-4xl font-bold text-center mb-8">My Profile</h1>

      <div className="space-y-4">
        {/* FIRST NAME */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">First Name:</h2>
          {editMode ? (
            <input
              type="text"
              value={userData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="border p-2 w-full rounded"
            />
          ) : (
            <p className="text-lg">{userData.firstName}</p>
          )}
        </div>

        {/* LAST NAME */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">Last Name:</h2>
          {editMode ? (
            <input
              type="text"
              value={userData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="border p-2 w-full rounded"
            />
          ) : (
            <p className="text-lg">{userData.lastName}</p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">Email:</h2>
          <p className="text-lg">{userData.email}</p>
        </div>

        {/* PHONE */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">Phone:</h2>
          {editMode ? (
            <input
              type="tel"
              value={userData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="border p-2 w-full rounded"
            />
          ) : (
            <p className="text-lg">{userData.phone || "Not provided"}</p>
          )}
        </div>

        {/* ADDRESS SECTION */}
<div className="pt-4">
  <h2 className="text-xl font-bold mb-2">Address</h2>

  {/* STREET (combined unit + street in one field) */}
  <div>
    <h3 className="text-gray-600 text-sm font-semibold">
      Unit / Street Address:
    </h3>
    {editMode ? (
      <input
        type="text"
        value={addr.street || ""}
        onChange={(e) => handleAddressChange("street", e.target.value)}
        className="border p-2 w-full rounded"
        placeholder="Example: Unit 2 / 15 George Street"
      />
    ) : (
      <p className="text-lg">{addr.street || "N/A"}</p>
    )}
  </div>

  {/* SUBURB */}
  <div>
    <h3 className="text-gray-600 text-sm font-semibold">Suburb:</h3>
    {editMode ? (
      <input
        type="text"
        value={addr.suburb || ""}
        onChange={(e) => handleAddressChange("suburb", e.target.value)}
        className="border p-2 w-full rounded"
      />
    ) : (
      <p className="text-lg">{addr.suburb || "N/A"}</p>
    )}
  </div>

  {/* STATE */}
  <div>
    <h3 className="text-gray-600 text-sm font-semibold">State:</h3>
    {editMode ? (
      <input
        type="text"
        value={addr.state || ""}
        onChange={(e) => handleAddressChange("state", e.target.value)}
        className="border p-2 w-full rounded"
      />
    ) : (
      <p className="text-lg">{addr.state || "N/A"}</p>
    )}
  </div>

  {/* POSTCODE */}
  <div>
    <h3 className="text-gray-600 text-sm font-semibold">Postcode:</h3>
    {editMode ? (
      <input
        type="text"
        value={addr.postcode || ""}
        onChange={(e) => handleAddressChange("postcode", e.target.value)}
        className="border p-2 w-full rounded"
      />
    ) : (
      <p className="text-lg">{addr.postcode || "N/A"}</p>
    )}
  </div>
</div>


        {/* BUTTONS */}
        <div className="flex justify-between pt-6">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ORDER HISTORY BUTTON */}
      <div className="mt-10 text-center">
        <button
          onClick={loadOrderHistory}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          {loadingOrders ? "Loading..." : "View Order History"}
        </button>
      </div>

      {/* ORDER HISTORY */}
      {showHistory && (
        <div className="mt-10 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Order History</h2>

          {orderHistory.length === 0 && (
            <p className="text-gray-500">No orders yet.</p>
          )}

          {orderHistory.map((order) => (
            <div
              key={order.id}
              className="border p-4 rounded-lg bg-white shadow mb-6"
            >
              <h3 className="text-xl font-bold">Order #{order.id}</h3>
              <p className="text-gray-600">Date: {formatDate(order.createdAt)}</p>
              <p className="text-gray-600">Address: {order.address}</p>
              <p className="font-semibold mt-3">
                Total Amount: ${order.totalAmount?.toFixed(2)}
              </p>
              <p className="font-semibold">Total Guests: {order.totalGuests}</p>
              <p className="font-semibold">Status: {order.status}</p>

              <h4 className="mt-4 font-bold text-lg">Items:</h4>

              {order.items?.map((item, i) => (
                <div key={i} className="ml-4 mt-3 p-3 border rounded bg-gray-50">
                  <p className="font-semibold text-lg">
                    {item.packageName || item.name}
                  </p>
                  <p className="text-sm">
                    Guests: <strong>{item.guests}</strong>
                  </p>
                  <p className="text-sm">
                    Price: <strong>${item.price}</strong>
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
