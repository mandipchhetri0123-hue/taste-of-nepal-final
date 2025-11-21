import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// ✅ Resend email client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return new NextResponse("Signature missing", { status: 400 });
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
    console.error("❌ Stripe signature mismatch:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("✅ Webhook Received:", event.type);

  // =======================================================
  // CHECKOUT COMPLETED → SAVE ORDER + SEND EMAIL
  // =======================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};

    // ---------------------------
    // Parse cart items
    // ---------------------------
    let items: any[] = [];
    try {
      items = metadata.items ? JSON.parse(metadata.items as string) : [];
    } catch (err) {
      console.error("❌ Metadata parse error:", err);
    }

    const fullName = metadata.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const totalGuests = items.reduce(
      (sum, i) => sum + (i.guests || 0),
      0
    );

    const userEmail =
      metadata.email ||
      session.customer_details?.email ||
      "";

    const packageName = items[0]?.name || "";

    // =======================================================
    // 1️⃣ SAVE ORDER TO FIRESTORE
    // =======================================================
    try {
      await adminDB.collection("orders").add({
        userId: metadata.userId || null,
        fullName,
        firstName,
        lastName,
        phone: metadata.phone || "",
        email: userEmail,
        address: metadata.address || "",
        note: metadata.note || "",
        items,
        packageName,
        totalGuests,
        totalAmount: (session.amount_total ?? 0) / 100,
        status: "Paid",
        createdAt: adminFieldValue.serverTimestamp(),
      });

      console.log("✅ Order saved successfully.");
    } catch (err) {
      console.error("❌ Firestore save error:", err);
      return new NextResponse("Firestore error", { status: 500 });
    }

    // =======================================================
    // 2️⃣ SEND EMAIL USING RESEND (works on Vercel)
    // =======================================================
    if (userEmail) {
      try {
        const htmlItems = items
          .map(
            (i) =>
              `<li><strong>${i.name}</strong> — ${i.guests} guests — $${i.price * i.guests}</li>`
          )
          .join("");

        await resend.emails.send({
          from: "Taste of Nepal <orders@tasteofnepal.com>",
          to: userEmail,
          subject: "Your Order Confirmation — Taste of Nepal",
          html: `
            <h2>Thank you for your order, ${firstName}!</h2>

            <p>Your payment has been successfully processed.</p>

            <h3>Order Summary</h3>
            <ul>${htmlItems}</ul>

            <p><strong>Total Paid:</strong> $${(session.amount_total ?? 0) / 100}</p>
            <p><strong>Guests:</strong> ${totalGuests}</p>

            <h3>FAQ</h3>
            <p><strong>1. When will I be contacted?</strong><br>
            Our team will reach out within 24 hours to confirm your catering details.</p>

            <p><strong>2. Can I modify my order?</strong><br>
            Yes! Just reply to this email.</p>

            <p><strong>3. Refund Policy</strong><br>
            Refunds depend on preparation progress. Contact support for help.</p>

            <br>
            <p>Thank you for choosing Taste of Nepal!</p>
          `,
        });

        console.log("📧 Email sent to:", userEmail);
      } catch (err) {
        console.error("❌ Email sending failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
