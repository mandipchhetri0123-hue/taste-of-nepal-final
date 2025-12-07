"use client";

import { useEffect, useRef, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AdminDashboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [email, setEmail] = useState("");

  const mainAdmin = "mandipchhetri0123@gmail.com";

  useEffect(() => {
    // Get logged-in user's email
    const unsub = onAuthStateChanged(getAuth(app), (user) => {
      if (user) setEmail(user.email || "");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/bell_notification.mp3");

    if (typeof window !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkNewOrders = () => {
      const newOrderId = localStorage.getItem("newOrder");
      if (!newOrderId) return;

      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(() => {});
      }

      if (Notification.permission === "granted") {
        new Notification("🛎 New Order Received", {
          body: `Order ID: ${newOrderId}`,
          icon: "/logo.png",
        });
      } else {
        alert(`🛎️ NEW ORDER RECEIVED!\nOrder ID: ${newOrderId}`);
      }

      localStorage.removeItem("newOrder");
    };

    const interval = setInterval(checkNewOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/admin/catering"
            className="p-6 bg-white border rounded-lg shadow-lg text-center hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">Manage Catering Menu</h2>
            <p className="text-gray-600 mt-2">Edit dishes, images & package options.</p>
          </Link>

          <Link
            href="/admin/view-orders"
            className="p-6 bg-white border rounded-lg shadow-lg text-center hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">View Orders</h2>
            <p className="text-gray-600 mt-2">See all customer orders & details.</p>
          </Link>

          <Link
            href="/admin/reports"
            className="p-6 bg-white border rounded-lg shadow-lg text-center hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">Reports</h2>
            <p className="text-gray-600 mt-2">Analytics, order summary & sales data.</p>
          </Link>

          <Link
            href="/admin/stock"
            className="p-6 bg-white border rounded-lg shadow-lg text-center hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">Manage Stock</h2>
            <p className="text-gray-600 mt-2">Adjust global stock for each food item.</p>
          </Link>

          {/* ⭐ ONLY MAIN ADMIN SEES THIS */}
          {email === mainAdmin && (
            <Link
              href="/admin/manage-users"
              className="p-6 bg-white border rounded-lg shadow-lg text-center hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold">Manage Users</h2>
              <p className="text-gray-600 mt-2">Search users & change roles.</p>
            </Link>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}
