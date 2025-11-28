"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

import {
  HomeIcon,
  ShoppingCartIcon,
  InformationCircleIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
            const data = userDoc.data() as any;
            const formatted = data.firstName
              ? data.firstName.charAt(0).toUpperCase() +
                data.firstName.slice(1).toLowerCase()
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

  const linkBase =
    "flex items-center gap-1 hover:text-red-600 transition-colors";

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
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>

        {/* Desktop Menu (right) */}
        <nav className="hidden md:flex gap-6 text-gray-700 items-center">
          <Link href="/" className={linkBase}>
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link href="/menu" className={linkBase}>
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Menu</span>
          </Link>

          <Link href="/about" className={linkBase}>
            <InformationCircleIcon className="h-5 w-5" />
            <span>About</span>
          </Link>

          <Link href="/contact" className={linkBase}>
            <PhoneIcon className="h-5 w-5" />
            <span>Contact</span>
          </Link>

          <Link href="/cart" className={linkBase}>
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Cart</span>
          </Link>

          {firstName ? (
            <Link
              href="/profile"
              className="flex items-center gap-1 font-semibold hover:text-red-600"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>Hi, {firstName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-6 py-4 text-lg gap-4 text-gray-700">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={linkBase}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/menu"
              onClick={() => setMenuOpen(false)}
              className={linkBase}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Menu</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className={linkBase}
            >
              <InformationCircleIcon className="h-5 w-5" />
              <span>About</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className={linkBase}
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Contact</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className={linkBase}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Cart</span>
            </Link>

            {firstName ? (
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Hi, {firstName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
