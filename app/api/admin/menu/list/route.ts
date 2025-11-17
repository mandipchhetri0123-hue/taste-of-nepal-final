import { NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function GET() {
  const snap = await adminDB.collection("menu").get();

  const items = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ success: true, items });
}
