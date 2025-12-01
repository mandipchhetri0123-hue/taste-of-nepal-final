import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

type MenuItem = {
  name: string;
  description: string;
  image: string;
  price?: number;
  stock?: number;
};

type PackageData = {
  name: string;
  price: number;
  minGuests: number;
  limits: {
    entrees: number;
    mains: number;
    desserts: number;
  };
  options: {
    entrees: MenuItem[];
    mains: MenuItem[];
    desserts: MenuItem[];
  };
};

export async function GET() {
  try {
    // 1) Load all packages (admin SDK, ignores Firestore rules)
    const [stdSnap, premSnap, delSnap] = await Promise.all([
      adminDB.collection("cateringPackages").doc("standard").get(),
      adminDB.collection("cateringPackages").doc("premium").get(),
      adminDB.collection("cateringPackages").doc("deluxe").get(),
    ]);

    const stdRaw = stdSnap.data() as any;
    const premRaw = premSnap.data() as any;
    const delRaw = delSnap.data() as any;

    // 2) Load global food stock
    const stockSnap = await adminDB.collection("foodStock").get();
    const stockMap: Record<string, number> = {};

    stockSnap.forEach((d: QueryDocumentSnapshot) => {
      const data = d.data() as any;
      const stockValue = typeof data.stock === "number" ? data.stock : 0;
      stockMap[d.id] = stockValue;
    });

    const enhance = (raw: any): PackageData => ({
      ...raw,
      options: {
        entrees: (raw.options?.entrees || []).map((item: any) => ({
          ...item,
          stock: stockMap[item.name] ?? item.stock ?? 0,
        })),
        mains: (raw.options?.mains || []).map((item: any) => ({
          ...item,
          stock: stockMap[item.name] ?? item.stock ?? 0,
        })),
        desserts: (raw.options?.desserts || []).map((item: any) => ({
          ...item,
          stock: stockMap[item.name] ?? item.stock ?? 0,
        })),
      },
    });

    const result = {
      standard: enhance(stdRaw),
      premium: enhance(premRaw),
      deluxe: enhance(delRaw),
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Catering list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
