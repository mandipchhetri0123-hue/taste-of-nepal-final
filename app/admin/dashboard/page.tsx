'use client';
import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <Link href="/admin/catering" className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Manage Catering Menu</h2>
          </Link>


          <Link href="/admin/view-orders" className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50">
            <h2 className="text-xl font-semibold">View Orders</h2>
          </Link>

          <Link href="/admin/reports" className="p-6 bg-white border rounded-lg shadow text-center hover:bg-gray-50">
            <h2 className="text-xl font-semibold">Reports</h2>
          </Link>

        </div>
      </div>
    </AdminRoute>
  );
}
