import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// ----------------------
// Nodemailer transporter
// ----------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
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

    // ------------------------------------
    // 1️⃣ Save Order to Firestore (unchanged)
    // ------------------------------------
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

    // ------------------------------------
    // 2️⃣ Send Confirmation Email to Customer
    // ------------------------------------
    const customerEmail =
      (metadata.email as string) ||
      session.customer_details?.email ||
      "";

    if (customerEmail) {
      try {
        const htmlItems = items
          .map(
            (i: any) =>
              `<li><strong>${i.name}</strong> — ${i.guests} guests — $${i.price * i.guests}</li>`
          )
          .join("");

        await transporter.sendMail({
          from: `Taste of Nepal <${process.env.EMAIL_USERNAME}>`,
          to: customerEmail,
          subject: "Order Confirmation — Taste of Nepal",
          html: `
            <h2>Thank you for your order, ${fullName}!</h2>

            <p>Your payment was successfully processed.</p>

            <h3>Order Summary</h3>
            <ul>${htmlItems}</ul>

            <p><strong>Total Paid:</strong> $${(session.amount_total ?? 0) / 100}</p>

            <h3>FAQ</h3>
            <p><strong>1. When will I be contacted?</strong><br>
            Our team will reach out within 24 hours to confirm your catering details.</p>

            <p><strong>2. Can I modify my order?</strong><br>
            Yes! Just reply to this email and we will assist you.</p>

            <p><strong>3. What about refunds?</strong><br>
            Refunds depend on preparation status. Contact us for assistance.</p>

            <br>
            <p>Thank you for choosing Taste of Nepal!</p>
          `,
        });

        console.log("📧 Confirmation email sent:", customerEmail);
      } catch (err: any) {
        console.error("❌ Email send error:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
