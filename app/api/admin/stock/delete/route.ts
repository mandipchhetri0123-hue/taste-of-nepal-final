import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await adminDB.collection("foodStock").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Stock Delete Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
