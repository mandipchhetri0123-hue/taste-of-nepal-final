'use client';

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
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
        const data = snap.data() as any;
        const formattedName = data.firstName
          ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
          : "User";
        setFirstName(formattedName);
        setRole(data.role || null);
      }
    });
  }, []);

  if (!mounted) return <div className="h-16" />;

  const linkBase =
    "flex items-center gap-1 hover:text-red-600 transition-colors";

  return (
    <header className="border-b bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO (left) */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="text-lg font-bold text-red-600">
            Taste of Nepal
          </span>
        </Link>

        {/* DESKTOP MENU (right) */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700">
          <Link href="/" className={linkBase}>
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link href="/menu" className={linkBase}>
            {/* you can swap icon if you want another */}
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

          {role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1 text-red-600 font-semibold"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          )}

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

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* MOBILE SLIDE-OUT MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t animate-slideDown">
          <nav className="flex flex-col p-4 space-y-4 text-lg text-gray-700">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={linkBase}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/menu"
              onClick={() => setMobileOpen(false)}
              className={linkBase}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Menu</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={linkBase}
            >
              <InformationCircleIcon className="h-5 w-5" />
              <span>About</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className={linkBase}
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Contact</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className={linkBase}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Cart</span>
            </Link>

            {role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1 text-red-600 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {firstName ? (
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Hi, {firstName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
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
