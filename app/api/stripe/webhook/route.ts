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

  // ================================
  // HANDLE PAID ORDER
  // ================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // PARSE ITEMS
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

    // ================================
    // 1️⃣ SAVE ORDER TO FIRESTORE
    // ================================
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
      return new NextResponse("Firestore error", { status: 500 });
    }

    // ================================
    // 2️⃣ SEND EMAIL USING FORMSPREE
    // ================================
    const customerEmail =
      (metadata.email as string) ||
      session.customer_details?.email ||
      "";

    if (customerEmail) {
      try {
        const htmlItems = items
          .map(
            (i: any) =>
              `• ${i.name} — ${i.guests} guests — $${i.price * i.guests}`
          )
          .join("\n");

        await fetch("https://formspree.io/f/xblwnoan", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerEmail,
            message: `
Thank you for your order, ${fullName}!

Your payment was successful and your order has been recorded.

===========================
ORDER SUMMARY
===========================

${htmlItems}

Total Paid: $${(session.amount_total ?? 0) / 100}

===========================
FAQ
===========================

1. When will I be contacted?
→ Our team will contact you within 24 hours to confirm your event details.

2. Can I modify my order?
→ Yes! Simply reply to this email and we will assist you.

3. What about refunds?
→ Refunds depend on the preparation status. Contact us to discuss options.

Thank you for choosing Taste of Nepal!
            `,
          }),
        });

        console.log("📧 Email sent via Formspree to:", customerEmail);
      } catch (emailErr: any) {
        console.error("❌ Error sending email:", emailErr.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
