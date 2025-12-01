import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snap = await adminDB.collection("foodStock").get();
    const items: any[] = [];

    snap.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as any;
      items.push({
        id: doc.id,
        name: data.name || doc.id,
        stock: typeof data.stock === "number" ? data.stock : 0,
      });
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("Stock List Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
