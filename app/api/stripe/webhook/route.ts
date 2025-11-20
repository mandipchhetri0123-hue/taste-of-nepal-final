import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")!;
  const rawBody = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const metadata = session.metadata || {};
    const items = JSON.parse(metadata.items || "[]");

    await addDoc(collection(db, "orders"), {
      userId: metadata.userId,
      fullName: metadata.fullName,
      phone: metadata.phone,
      address: metadata.address,
      note: metadata.note,
      items,
      totalAmount: (session.amount_total! / 100),
      status: "Paid",
      createdAt: serverTimestamp(),
    });
  }

  return NextResponse.json({ received: true });
}
