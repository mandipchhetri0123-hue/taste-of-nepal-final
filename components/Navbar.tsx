'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/config";

export default function Navbar() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return setFirstName(null);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFirstName(
            data.firstName
              ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
              : "User"
          );
          setRole(data.role || null);
        }
      } catch {
        setFirstName("User");
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!mounted) return <header className="h-16 border-b bg-white shadow-sm"></header>;

  return (
    <header className="border-b bg-white shadow-sm w-full overflow-x-hidden">
      <div className="w-full px-4 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="text-lg font-bold text-red-600 whitespace-nowrap">
            Taste of Nepal
          </span>
        </Link>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-3 flex-wrap text-gray-700 text-sm sm:text-base">

          <Link href="/" className="hover:text-red-600 whitespace-nowrap">Home</Link>
          <Link href="/menu" className="hover:text-red-600 whitespace-nowrap">Menu</Link>
          <Link href="/about" className="hover:text-red-600 whitespace-nowrap">About</Link>
          <Link href="/contact" className="hover:text-red-600 whitespace-nowrap">Contact</Link>
          <Link href="/cart" className="hover:text-red-600 whitespace-nowrap">Cart</Link>

          {role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-red-600 font-bold whitespace-nowrap"
            >
              Admin Panel
            </Link>
          )}

          {firstName ? (
            <Link href="/profile" className="font-semibold hover:text-red-600 whitespace-nowrap">
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-red-600 whitespace-nowrap">
              Login
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}
