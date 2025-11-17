import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pkg, data } = body;

    await adminDB
      .collection("cateringPackages")
      .doc(pkg)
      .set(data, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
