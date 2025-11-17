'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase"; // <-- Ensure this path is correct

export default function NavbarClientOnly() {
  const [firstName, setFirstName] = useState<string | null>(null);

  // Prevent hydration mismatch (run ONLY on client)
  if (typeof window === "undefined") {
    return null;  // <-- This is valid HERE inside component
  }

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const formatted =
              data.firstName
                ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
                : "User";
            setFirstName(formatted);
          } else {
            const fallbackName =
              user.displayName?.split(" ")[0] ||
              user.email?.split("@")[0] ||
              "User";
            setFirstName(
              fallbackName.charAt(0).toUpperCase() +
              fallbackName.slice(1).toLowerCase()
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setFirstName("User");
        }
      } else {
        setFirstName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b bg-white shadow-sm transition-opacity duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Taste of Nepal Logo" width={64} height={64} />
          <span className="text-xl font-bold text-nepal-red">Taste of Nepal</span>
        </Link>

        <nav className="flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:text-nepal-red">Home</Link>
          <Link href="/menu" className="hover:text-nepal-red">Menu</Link>
          <Link href="/about" className="hover:text-nepal-red">About</Link>
          <Link href="/contact" className="hover:text-nepal-red">Contact</Link>
          <Link href="/cart" className="hover:text-nepal-red flex items-center">
            <i className="fas fa-shopping-cart mr-1" /> Cart
          </Link>

          {firstName ? (
            <Link
              href="/profile"
              className="hover:text-nepal-red font-semibold transition-opacity"
            >
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-nepal-red">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
