import { NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";

export async function GET() {
  const std = await adminDB.collection("cateringPackages").doc("standard").get();
  const prem = await adminDB.collection("cateringPackages").doc("premium").get();
  const del = await adminDB.collection("cateringPackages").doc("deluxe").get();

  return NextResponse.json({
    success: true,
    packages: {
      standard: std.data(),
      premium: prem.data(),
      deluxe: del.data()
    }
  });
}
