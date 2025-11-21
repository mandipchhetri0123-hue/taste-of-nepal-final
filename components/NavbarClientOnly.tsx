'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function NavbarClientOnly() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return setFirstName(null);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFirstName(
            data.firstName
              ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
              : "User"
          );
        } else {
          const fallback =
            user.displayName?.split(" ")[0] ||
            user.email?.split("@")[0] ||
            "User";
          setFirstName(fallback);
        }
      } catch (err) {
        console.error(err);
        setFirstName("User");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b bg-white shadow-sm w-full overflow-x-hidden">
      <div className="w-full px-4 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="Taste of Nepal Logo" width={48} height={48} />
          <span className="text-lg font-bold text-nepal-red whitespace-nowrap">
            Taste of Nepal
          </span>
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-3 flex-wrap text-gray-700 text-sm sm:text-base">

          <Link href="/" className="hover:text-nepal-red whitespace-nowrap">Home</Link>
          <Link href="/menu" className="hover:text-nepal-red whitespace-nowrap">Menu</Link>
          <Link href="/about" className="hover:text-nepal-red whitespace-nowrap">About</Link>
          <Link href="/contact" className="hover:text-nepal-red whitespace-nowrap">Contact</Link>

          <Link href="/cart" className="hover:text-nepal-red flex items-center whitespace-nowrap">
            <i className="fas fa-shopping-cart mr-1" /> Cart
          </Link>

          {firstName ? (
            <Link href="/profile" className="hover:text-nepal-red font-semibold whitespace-nowrap">
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-nepal-red whitespace-nowrap">Login</Link>
          )}

        </nav>
      </div>
    </header>
  );
}
