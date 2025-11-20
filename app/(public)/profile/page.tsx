"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { app } from "@/firebase/config";

type UserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
};

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

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
  }, [auth, db, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!auth.currentUser || !userData) return;

    // Optional: basic checks
    if (!userData.firstName?.trim() || !userData.lastName?.trim()) {
      alert("Please enter your first and last name.");
      return;
    }

    if (userData.phone && !phoneRegex.test(userData.phone.trim())) {
      alert("Please enter a valid phone number in international format, e.g. +61412345678.");
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, {
        firstName: userData.firstName?.trim() || "",
        lastName: userData.lastName?.trim() || "",
        phone: userData.phone?.trim() || "",
        gender: userData.gender || "",
        dob: userData.dob || "",
      });

      alert("✅ Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("firstName", e.target.value)
              }
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("lastName", e.target.value)
              }
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("phone", e.target.value)
              }
              className="border p-2 w-full rounded"
              placeholder="e.g. +61412345678"
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
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("gender", e.target.value)
              }
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("dob", e.target.value)
              }
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
    </div>
  );
}
