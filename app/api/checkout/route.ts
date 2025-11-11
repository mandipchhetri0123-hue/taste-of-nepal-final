import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
    const body = await req.json(); // { lines, successUrl, cancelUrl, orderDetails }

    // ✅ Create payment session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: body.lines.map((l: any) => ({
        price_data: {
          currency: "aud",
          product_data: { name: l.name },
          unit_amount: Math.round(l.price * 100),
        },
        quantity: l.qty,
      })),
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    });

    // ✅ Build a readable message
    const order = body.orderDetails;
    const messageBody = `
🍽️ New Order Received!
---------------------------
Customer: ${order.fullName}
Phone: ${order.phone}
Address: ${order.address}

Package: ${order.packageName}
Guests: ${order.guests}
Price: ${order.price} per person

Entrees: ${order.entrees.join(", ")}
Mains: ${order.mains.join(", ")}
Desserts: ${order.desserts.join(", ")}

Payment Status: Pending / Received
---------------------------
Check your admin dashboard for details.
`;

    // ✅ Send push notification to admin
    const adminToken = process.env.ADMIN_FCM_TOKEN;
    if (adminToken) {
      await admin.messaging().send({
        token: adminToken,
        notification: {
          title: "New Order from " + order.fullName,
          body: `${order.packageName} for ${order.guests} guests.`,
        },
      });
      console.log("✅ Push notification sent successfully!");
    } else {
      console.warn("⚠️ No ADMIN_FCM_TOKEN found.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error processing checkout:", error);
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
