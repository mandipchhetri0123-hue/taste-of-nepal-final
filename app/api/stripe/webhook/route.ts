import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const rawBody = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ------------------------------
  // Handle successful payment
  // ------------------------------
  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    const metadata = session.metadata || {};
    const items = JSON.parse(metadata.items || "[]");

    const fullName = metadata.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const packageName = items[0]?.name || "";
    const totalGuests = items.reduce(
      (sum: number, item: any) => sum + (item.guests || 0),
      0
    );

    // Save to Firestore in clean format
    await addDoc(collection(db, "orders"), {
      userId: metadata.userId,
      fullName,
      firstName,
      lastName,
      phone: metadata.phone,
      email: metadata.email || "",
      address: metadata.address,
      note: metadata.note || "",
      items,
      packageName,
      totalGuests,
      totalAmount: (session.amount_total ?? 0) / 100,
      status: "Paid",
      createdAt: serverTimestamp(),
    });
  }

  return NextResponse.json({ received: true });
}
