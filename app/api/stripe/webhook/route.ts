import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminFieldValue } from "@/lib/firebaseAdmin";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// Resend instance
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
      metadata.email || session.customer_details?.email || "";

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
    // 2️⃣ REDUCE GLOBAL STOCK: foodStock/{dishName}
    // ------------------------------------
    try {
      for (const orderItem of items) {
        const selections = orderItem.selections as
          | { entrees: string[]; mains: string[]; desserts: string[] }
          | undefined;
        const guests = orderItem.guests || 0;

        if (!selections || guests <= 0) {
          console.log("⚠️ Skipping malformed item for stock:", orderItem);
          continue;
        }

        const categories: Array<"entrees" | "mains" | "desserts"> = [
          "entrees",
          "mains",
          "desserts",
        ];

        for (const category of categories) {
          const selectedNames = selections[category] || [];

          for (const dishName of selectedNames) {
            // doc id in foodStock is the dish name (e.g., "Pakoda")
            const stockRef =
              adminDB
                .collection("foodStock")
                .doc(dishName) as FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;

            await adminDB.runTransaction(
              async (transaction: FirebaseFirestore.Transaction) => {
                const snap = await transaction.get(stockRef);

                if (!snap.exists) {
                  console.warn("⚠️ foodStock doc not found for:", dishName);
                  return;
                }

                const data = snap.data() as any;
                const currentStock =
                  typeof data.stock === "number" ? data.stock : 0;

                const newStock = Math.max(currentStock - guests, 0);

                transaction.update(stockRef, { stock: newStock });

                console.log(
                  `🟢 Global stock updated: ${dishName} (${currentStock} → ${newStock}) | guests: ${guests}`
                );
              }
            );
          }
        }
      }
    } catch (err: any) {
      console.error("❌ Global stock update error:", err.message);
      // Do not fail the webhook – payment + order already processed
    }

   // ------------------------------------
// 2.5️⃣ SAFE STRIPE RECEIPT URL FETCH (NO TS ERRORS)
// ------------------------------------
let receiptUrl: string | null = null;

try {
  if (session.payment_intent) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    // Stripe Response wrapper must be cast safely
    const piResponse: any = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ["charges"] }
    );

    // Real PaymentIntent is inside .data
    const paymentIntent = piResponse.data ?? piResponse;

    const charge = paymentIntent.charges?.data?.[0];
    if (charge?.receipt_url) {
      receiptUrl = charge.receipt_url;
      console.log("🧾 Receipt URL:", receiptUrl);
    } else {
      console.log("ℹ️ No receipt URL found on charge.");
    }
  }
} catch (err) {
  console.error("❌ Failed to fetch Stripe receipt URL:", err);
}


    // ------------------------------------
    // 3️⃣ SEND PROFESSIONAL EMAIL RECEIPT
    // ------------------------------------
    if (customerEmail) {
      try {
        // Format each ordered package
        const formattedItems = items
          .map((item: any) => {
            const ents = item.selections?.entrees?.join(", ") || "None";
            const mains = item.selections?.mains?.join(", ") || "None";
            const dess = item.selections?.desserts?.join(", ") || "None";

            return `
          <div style="margin-bottom:20px; padding:15px; border:1px solid #eee; border-radius:8px;">
            <h3 style="margin:0; font-size:18px; color:#D62828;">
              ${item.name} — ${item.guests} guests — $${item.price * item.guests}
            </h3>

            <p style="margin:8px 0 2px;"><strong>Entrees:</strong> ${ents}</p>
            <p style="margin:2px 0;"><strong>Mains:</strong> ${mains}</p>
            <p style="margin:2px 0;"><strong>Desserts:</strong> ${dess}</p>

            ${
              item.selections?.specialRequest
                ? `<p style="margin-top:8px;"><strong>Special Request:</strong> ${item.selections.specialRequest}</p>`
                : ""
            }
          </div>
        `;
          })
          .join("");

        const totalPaid = (session.amount_total ?? 0) / 100;

        const receiptBlock = receiptUrl
          ? `
          <hr style="margin:25px 0;">
          <p>
            You can view and download your official Stripe receipt here:<br>
            <a href="${receiptUrl}" target="_blank" style="color:#D62828;">
              View Stripe Receipt
            </a>
          </p>
        `
          : "";

        await resend.emails.send({
          from: "Taste of Nepal <orders@tasteofnepal.xyz>",
          to: customerEmail,
          subject: "Your Taste of Nepal Order Confirmation",
          html: `
        <div style="font-family:Arial, sans-serif; line-height:1.6; color:#333;">
          
          <h2 style="color:#D62828;">Thank you for your order, ${fullName}!</h2>

          <p>Your catering order has been successfully paid and recorded.</p>

          <h3 style="margin-top:20px;">Order Details</h3>

          ${formattedItems}

          <p style="font-size:16px; margin-top:15px;">
            <strong>Total Paid:</strong> $${totalPaid}
          </p>

          ${receiptBlock}

          <hr style="margin:25px 0;">

          <p>
            If you need to update your order details,<br>
            please contact us at <strong>support@urkafeniof.resend.app</strong>.
          </p>

          <p style="margin-top:25px;">
            Thank you for choosing <strong>Taste of Nepal 🇳🇵</strong>
          </p>

        </div>
      `,
        });

        console.log("📨 Professional order email sent →", customerEmail);
      } catch (err: any) {
        console.error("❌ Email error:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
