import { NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function GET() {
  try {
    const snap = await adminDB
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    // ⚠️ FIX: Add type for doc to prevent TS error
    const orders = snap.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Admin order error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
