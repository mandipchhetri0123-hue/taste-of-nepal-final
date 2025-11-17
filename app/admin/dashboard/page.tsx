'use client';

import { useEffect, useState, useRef } from "react";
import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";

export default function AdminDashboard() {
  const [newOrderId, setNewOrderId] = useState<string | null>(null);

  // Create audio reference (so it doesn't reload each time)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load sound (public/notification_long.wav)
    audioRef.current = new Audio("/notification_long.wav");
    const interval = setInterval(() => {
      const orderId = localStorage.getItem("newOrder");
      if (orderId) {
        setNewOrderId(orderId);

        // 🔊 PLAY NOTIFICATION SOUND
        if (audioRef.current) {
          audioRef.current.volume = 1.0;
          audioRef.current.play().catch(() => {});
        }

        // Show popup alert
        alert(`🛎️ NEW ORDER RECEIVED!\nOrder ID: ${orderId}`);

        // Remove flag so it doesn’t repeat
        localStorage.removeItem("newOrder");
      }
    }, 2000);

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
