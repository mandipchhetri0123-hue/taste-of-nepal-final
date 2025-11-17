'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/config";   // ✅ correct path

export default function Navbar() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 🔥 Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Load user (name + role)
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirstName(null);
        setRole(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();

          // Format name
          const formatted =
            data.firstName
              ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
              : "User";

          setFirstName(formatted);
          setRole(data.role || null); // ✅ Read role
        } else {
          setFirstName("User");
          setRole(null);
        }
      } catch (err) {
        console.error("User fetch error:", err);
        setFirstName("User");
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hide navbar until mounted (fix hydration)
  if (!mounted) {
    return <header className="h-16 border-b bg-white shadow-sm"></header>;
  }

  return (
    <header className="border-b bg-white shadow-sm transition-opacity duration-300">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <span className="text-xl font-bold text-red-600">Taste of Nepal</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <Link href="/menu" className="hover:text-red-600">Menu</Link>
          <Link href="/about" className="hover:text-red-600">About</Link>
          <Link href="/contact" className="hover:text-red-600">Contact</Link>
          <Link href="/cart" className="hover:text-red-600">Cart</Link>

          {/* 🔥 Show admin panel if role = 'admin' */}
          {role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-red-600 font-bold hover:underline"
            >
              Admin Panel
            </Link>
          )}

          {/* Logged in user */}
          {firstName ? (
            <Link href="/profile" className="font-semibold hover:text-red-600">
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-red-600">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
