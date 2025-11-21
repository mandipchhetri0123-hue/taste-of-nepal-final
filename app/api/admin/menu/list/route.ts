import { NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function GET() {
  try {
    const snap = await adminDB.collection("menu").get();

    // Fix: Add type for `doc`
    const items = snap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Menu list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
