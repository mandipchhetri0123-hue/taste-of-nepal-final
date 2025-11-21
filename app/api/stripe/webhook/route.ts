import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")!;
  const rawBody = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    const metadata = session.metadata || {};
    const items = JSON.parse(metadata.items || "[]");

    const fullName = metadata.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const totalGuests = items.reduce(
      (sum: number, i: any) => sum + (i.guests || 0),
      0
    );

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
      packageName: items[0]?.name || "",
      totalGuests,
      totalAmount: (session.amount_total || 0) / 100,
      status: "Paid",
      createdAt: serverTimestamp(),
    });

    console.log("✔ Order saved to Firestore");
  }

  return NextResponse.json({ received: true });
}
