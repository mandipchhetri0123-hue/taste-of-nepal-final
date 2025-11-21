import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";

export const config = {
  api: {
    bodyParser: false, // ⛔ Necessary for Stripe webhook
  },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// RAW BODY READER for Vercel
async function buffer(req: Request) {
  const chunks = [];
  const reader = req.body?.getReader();
  if (!reader) return Buffer.from("");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const rawBody = await buffer(req);

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

  // ============================================
  // CHECKOUT SUCCESS
  // ============================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    let items: any[] = [];
    try {
      items = metadata.items ? JSON.parse(metadata.items) : [];
    } catch (e) {
      console.error("❌ JSON parse error:", e);
    }

    const fullName = metadata.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");
    const email =
      metadata.email ||
      session.customer_details?.email ||
      "";

    // Save order
    await adminDB.collection("orders").add({
      userId: metadata.userId || null,
      fullName,
      firstName,
      lastName,
      phone: metadata.phone || "",
      email,
      address: metadata.address || "",
      note: metadata.note || "",
      items,
      packageName: items[0]?.name || "",
      totalGuests: items.reduce((s, i) => s + i.guests, 0),
      totalAmount: (session.amount_total ?? 0) / 100,
      status: "Paid",
      createdAt: adminFieldValue.serverTimestamp(),
    });

    console.log("✅ Order saved to Firestore");

    // ============================================
    // SEND EMAIL USING FORMSPREE
    // ============================================
    if (email) {
      try {
        await fetch("https://formspree.io/f/xblwnoan", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            message: `
Thank you for your order, ${fullName}!

Your order has been received and payment was successful.

--- ORDER SUMMARY ---

${items.map((i) => `${i.name} - ${i.guests} guests`).join("\n")}

Total Paid: $${(session.amount_total ?? 0) / 100}

--- FAQ ---

1. When will I be contacted?
→ Within 24 hours.

2. Can I modify my order?
→ Yes! Reply to this email.

3. Refunds?
→ Contact customer support.

Thank you for choosing Taste of Nepal!
`,
          }),
        });

        console.log("📧 Email sent to:", email);
      } catch (emailErr) {
        console.error("❌ Email send failed:", emailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
