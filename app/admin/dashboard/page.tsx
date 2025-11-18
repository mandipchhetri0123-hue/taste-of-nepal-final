"use client";

import { useEffect, useRef } from "react";
import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";

export default function AdminDashboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load sound
    audioRef.current = new Audio("bell_notification.mp3");

    // Request permission for desktop notifications
    if (typeof window !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkNewOrders = () => {
      const newOrderId = localStorage.getItem("newOrder");
      if (!newOrderId) return;

      // PLAY SOUND
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(() => {});
      }

      // DESKTOP POPUP
      if (Notification.permission === "granted") {
        new Notification("🛎 New Order Received", {
          body: `Order ID: ${newOrderId}`,
          icon: "/logo.png",
        });
      } else {
        alert(`🛎️ NEW ORDER RECEIVED!\nOrder ID: ${newOrderId}`);
      }

      // Clear flag
      localStorage.removeItem("newOrder");
    };

    const interval = setInterval(checkNewOrders, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <Link
            href="/admin/catering"
            className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">Manage Catering Menu</h2>
          </Link>

          <Link
            href="/admin/view-orders"
            className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">View Orders</h2>
          </Link>

          <Link
            href="/admin/reports"
            className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">Reports</h2>
          </Link>

        </div>
      </div>
    </AdminRoute>
  );
}
