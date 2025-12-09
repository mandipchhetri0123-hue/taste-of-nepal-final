"use client";
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const auth = getAuth(app);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      // LOGIN USER
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // ========================
      // 🔥 AUTO MIGRATE IF VERIFIED
      // ========================
      if (user.emailVerified) {
        const pendingRef = doc(db, "pendingUsers", user.uid);
        const pendingSnap = await getDoc(pendingRef);

        if (pendingSnap.exists()) {
          const data = pendingSnap.data();

          // Move to users/{uid}
          await setDoc(doc(db, "users", user.uid), {
            ...data,
            createdAt: serverTimestamp(),
          });

          // Remove from pendingUsers
          await deleteDoc(pendingRef);
        }
      }

      // ========================
      // FETCH USER DATA
      // ========================
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const firstName = userDoc.exists()
        ? userDoc.data().firstName
        : "Customer";

      localStorage.setItem("userFirstName", firstName);

      alert(`Welcome back, ${firstName}!`);
      window.location.href = "/menu";
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-heading text-center text-nepal-red mb-6">
          Welcome Back
        </h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-nepal-blue hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
