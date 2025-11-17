import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const docRef = await adminDB.collection("menu").add({
      name: body.name,
      price: body.price,
      description: body.description,
      image: body.image,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
