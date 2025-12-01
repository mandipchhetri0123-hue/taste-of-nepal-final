import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { id, stock } = await req.json();

    if (!id || typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await adminDB.collection("foodStock").doc(id).set(
      {
        name: id,
        stock,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Stock Update Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
