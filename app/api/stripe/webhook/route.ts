import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// Resend (make sure RESEND_API_KEY is added in Vercel)
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Required for Stripe raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
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

  console.log("🔔 Stripe webhook event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Parse items array
    let items: any[] = [];
    try {
      items = metadata.items ? JSON.parse(metadata.items as string) : [];
    } catch (e) {
      console.error("❌ Failed parsing items:", e);
    }

    const fullName = (metadata.fullName as string) || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const totalGuests = items.reduce(
      (sum, item) => sum + (item.guests || 0),
      0
    );

    const packageName = items[0]?.name || "";
    const customerEmail =
      (metadata.email as string) ||
      session.customer_details?.email ||
      "";

    // ------------------------------------
    // 1️⃣ SAVE ORDER TO FIRESTORE
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

      console.log("✅ Order saved to Firestore");
    } catch (error: any) {
      console.error("❌ Error saving order:", error.message);
      return new NextResponse("Firestore error", { status: 500 });
    }

    // ------------------------------------
    // 2️⃣ SEND EMAIL USING RESEND
    // ------------------------------------
    if (customerEmail) {
      try {
        const htmlItems = items
          .map(
            (i) =>
              `<li><strong>${i.name}</strong> — ${i.guests} guests — $${i.price * i.guests}</li>`
          )
          .join("");

        await resend.emails.send({
          from: "Taste of Nepal <orders@resend.dev>", // ✔ No domain verification required
          to: customerEmail,
          subject: "Your Order Confirmation — Taste of Nepal",
          html: `
            <h2>Thank you for your order, ${fullName}!</h2>

            <p>Your payment has been successfully completed.</p>

            <h3>Order Summary</h3>
            <ul>${htmlItems}</ul>

            <p><strong>Total Paid:</strong> $${(session.amount_total ?? 0) / 100}</p>

            <h3>FAQ</h3>
            <p><strong>1. When will I be contacted?</strong><br>
            Our team will contact you within 24 hours.</p>

            <p><strong>2. Can I modify my order?</strong><br>
            Yes. Simply reply to this email.</p>

            <p><strong>3. Refunds?</strong><br>
            Refund eligibility depends on preparation stage. Contact support.</p>

            <br>
            <p>Thank you for choosing Taste of Nepal! 🇳🇵</p>
          `,
        });

        console.log("📧 Email sent to:", customerEmail);
      } catch (err: any) {
        console.error("❌ Email send error:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
