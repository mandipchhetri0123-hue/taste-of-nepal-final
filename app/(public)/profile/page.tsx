"use client";

import { useEffect, useState, ChangeEvent } from "react";
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
type UserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
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

  // ORDER HISTORY STATES
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
  // INPUT UPDATE HANDLER
  // ==========================
  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
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
        gender: userData.gender,
        dob: userData.dob,
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
  // ORDER HISTORY — FIRESTORE
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

  // ==========================
  // DATE FORMATTER
  // ==========================
  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleDateString() + " — " + d.toLocaleTimeString();
  };

  // ==========================
  // LOADING SCREEN
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

  // ==========================
  // MAIN PROFILE UI
  // ==========================
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-12">
      <h1 className="text-4xl font-bold text-center mb-8">My Profile</h1>

      {/* Profile Fields */}
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
              placeholder="+61412345678"
            />
          ) : (
            <p className="text-lg">{userData.phone || "Not provided"}</p>
          )}
        </div>

        {/* GENDER */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">Gender:</h2>
          {editMode ? (
            <select
              value={userData.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-lg">{userData.gender || "Not specified"}</p>
          )}
        </div>

        {/* DOB */}
        <div>
          <h2 className="text-gray-600 text-sm font-semibold">Date of Birth:</h2>
          {editMode ? (
            <input
              type="date"
              value={userData.dob || ""}
              onChange={(e) => handleChange("dob", e.target.value)}
              className="border p-2 w-full rounded"
            />
          ) : (
            <p className="text-lg">{userData.dob || "Not specified"}</p>
          )}
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

      {/* ORDER HISTORY SECTION */}
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
                <div
                  key={i}
                  className="ml-4 mt-3 p-3 border rounded bg-gray-50"
                >
                  <p className="font-semibold text-lg">
                    {item.packageName || item.name}
                  </p>

                  <p className="text-sm">
                    Guests: <strong>{item.guests}</strong>
                  </p>

                  <p className="text-sm">
                    Price: <strong>${item.price}</strong>
                  </p>

                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Entrees:</strong>{" "}
                      {(item.selections?.entrees || []).join(", ")}
                    </p>
                    <p>
                      <strong>Mains:</strong>{" "}
                      {(item.selections?.mains || []).join(", ")}
                    </p>
                    <p>
                      <strong>Desserts:</strong>{" "}
                      {(item.selections?.desserts || []).join(", ")}
                    </p>

                    {item.specialRequest && (
                      <p className="mt-2 text-sm text-blue-700">
                        <strong>Special Request:</strong>{" "}
                        {item.specialRequest}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
