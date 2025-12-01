import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const id = name.trim();

    const docRef = adminDB.collection("foodStock").doc(id);

    const snap = await docRef.get();

    // Avoid overwriting if already exists
    if (!snap.exists) {
      await docRef.set({
        name: id,
        stock: 0,           // default until admin updates
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
