import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



// Stripe Instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// Resend Instance
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
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
    console.error("❌ Webhook verification failed:", err.message);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  console.log("🔔 Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Parse items safely
    let items: any[] = [];
    try {
      items = metadata.items ? JSON.parse(metadata.items) : [];
    } catch (e) {
      console.error("❌ Metadata parse error:", e);
    }

    const fullName = metadata.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const customerEmail =
      metadata.email ||
      session.customer_details?.email ||
      "";

    const totalGuests = items.reduce(
      (sum, item) => sum + (item.guests || 0),
      0
    );

    const packageName = items[0]?.name || "";

    // ------------------------------------
    // 1️⃣ SAVE ORDER INTO FIRESTORE
    // ------------------------------------
    try {
      await adminDB.collection("orders").add({
        userId: metadata.userId || null,
        fullName,
        firstName,
        lastName,
        phone: metadata.phone || "",
        email: customerEmail,
        address: metadata.address || "",
        note: metadata.note || "",
        items,
        packageName,
        totalGuests,
        totalAmount: (session.amount_total ?? 0) / 100,
        status: "Paid",
        createdAt: adminFieldValue.serverTimestamp(),
      });

      console.log("✅ Order successfully stored in Firestore");
    } catch (err: any) {
      console.error("❌ Firestore error:", err.message);
      return new NextResponse("Database error", { status: 500 });
    }

    // ------------------------------------
    // 2️⃣ SEND EMAIL WITH RESEND
    // ------------------------------------
    if (customerEmail) {
      try {
        const htmlItems = items
          .map(
            (i: any) =>
              `<li><strong>${i.name}</strong> — ${i.guests} guests — $${i.price * i.guests}</li>`
          )
          .join("");

        await resend.emails.send({
          from: "Taste of Nepal <orders@tasteofnepal.xyz>",
          to: customerEmail,
          subject: "Your Order Confirmation — Taste of Nepal",
          html: `
            <h2>Thank you for your order, ${fullName}!</h2>

            <p>Your payment has been successfully completed.</p>

            <h3>Order Summary</h3>
            <ul>${htmlItems}</ul>

            <p><strong>Total Paid:</strong> $${(session.amount_total ?? 0) / 100}</p>

            <h3>FAQ</h3>
            <p><strong>1. When will we contact you?</strong><br>Within 24 hours.</p>
            <p><strong>2. Can you modify your order?</strong><br>Yes, reply to this email.</p>
            <p><strong>3. Refunds?</strong><br>Depends on preparation stage. Contact us.</p>

            <br>
            <p>Thank you for choosing Taste of Nepal 🇳🇵</p>
          `,
        });

        console.log("📨 Email sent to:", customerEmail);
      } catch (err: any) {
        console.error("❌ Email error:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
