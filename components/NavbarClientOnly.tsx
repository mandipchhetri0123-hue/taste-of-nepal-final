"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function NavbarClientOnly() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const formatted = data.firstName
              ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
              : "User";
            setFirstName(formatted);
          } else {
            setFirstName("User");
          }
        } catch {
          setFirstName("User");
        }
      } else {
        setFirstName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" width={50} height={50} alt="Logo" />
          <span className="text-lg font-bold text-red-600">Taste of Nepal</span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-gray-700 items-center">

          <Link href="/" className="hover:text-red-600">Home</Link>
          <Link href="/menu" className="hover:text-red-600">Menu</Link>
          <Link href="/about" className="hover:text-red-600">About</Link>
          <Link href="/contact" className="hover:text-red-600">Contact</Link>
          <Link href="/cart" className="hover:text-red-600">Cart</Link>

          {firstName ? (
            <Link href="/profile" className="font-semibold hover:text-red-600">
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-red-600">Login</Link>
          )}
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-6 py-4 text-lg gap-4">

            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/menu" onClick={() => setMenuOpen(false)}>Menu</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>

            {firstName ? (
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Hi, {firstName}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
