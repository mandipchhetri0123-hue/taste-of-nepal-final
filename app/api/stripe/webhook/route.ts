import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ No stripe-signature header");
    return new NextResponse("No signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("✅ Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    let items: any[] = [];
    try {
      items = metadata.items ? JSON.parse(metadata.items as string) : [];
    } catch (e) {
      console.error("❌ Failed to parse items metadata:", e);
    }

    const fullName = (metadata.fullName as string) || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const totalGuests = items.reduce(
      (sum, item) => sum + (item.guests || 0),
      0
    );

    const packageName = items[0]?.name || "";

    try {
      await adminDB.collection("orders").add({
        userId: metadata.userId || null,
        fullName,
        firstName,
        lastName,
        phone: metadata.phone || "",
        email:
          (metadata.email as string) ||
          session.customer_details?.email ||
          "",
        address: metadata.address || "",
        note: metadata.note || "",
        items,
        packageName,
        totalGuests,
        totalAmount: (session.amount_total ?? 0) / 100,
        status: "Paid",
        createdAt: adminFieldValue.serverTimestamp(),
      });

      console.log("✅ Order saved to Firestore");
    } catch (err: any) {
      console.error("❌ Firestore save error:", err.message);
      // Return 500 so you can see the error in Stripe "Event deliveries"
      return new NextResponse("Firestore error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
