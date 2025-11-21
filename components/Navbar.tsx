'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function Navbar() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirstName(null);
        setRole(null);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        const formattedName =
          data.firstName.charAt(0).toUpperCase() +
          data.firstName.slice(1).toLowerCase();
        setFirstName(formattedName);
        setRole(data.role || null);
      }
    });
  }, []);

  if (!mounted) return <div className="h-16"></div>;

  return (
    <header className="border-b bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="text-lg font-bold text-red-600">Taste of Nepal</span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <Link href="/menu" className="hover:text-red-600">Menu</Link>
          <Link href="/about" className="hover:text-red-600">About</Link>
          <Link href="/contact" className="hover:text-red-600">Contact</Link>
          <Link href="/cart" className="hover:text-red-600">Cart</Link>

          {role === "admin" && (
            <Link href="/admin/dashboard" className="text-red-600 font-semibold">
              Admin
            </Link>
          )}

          {firstName ? (
            <Link href="/profile" className="font-semibold hover:text-red-600">
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-red-600">Login</Link>
          )}
        </nav>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE SLIDE-OUT MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t animate-slideDown">
          <nav className="flex flex-col p-4 space-y-4 text-lg">

            <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/menu" onClick={() => setMobileOpen(false)}>Menu</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>

            {role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="text-red-600 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            )}

            {firstName ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                Hi, {firstName}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
