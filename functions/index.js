/* eslint-env node */

/**
 * @fileoverview Discotive OS - Razorpay Automation Webhook
 * @module Backend/Billing
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Razorpay = require("razorpay");

admin.initializeApp();
const db = admin.firestore();

/**
 * GENERATE SUBSCRIPTION API
 */
exports.createProSubscription = functions.https.onCall(
  async (data, context) => {
    // 1. Security Guard: Ensure user is logged in
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Unauthorized Gateway Access.",
      );
    }

    const uid = context.auth.uid;

    // INITIALIZE RAZORPAY HERE (At runtime, when env vars are guaranteed to exist)
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
      const subscription = await rzp.subscriptions.create({
        plan_id: "plan_SWdp3DusTALjoj",
        total_count: 99,
        customer_notify: 1,
        notes: {
          firebase_uid: uid,
        },
      });

      return { subscriptionId: subscription.id };
    } catch (error) {
      console.error("[SYSTEM FAULT] Subscription creation failed:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to communicate with payment gateway.",
      );
    }
  },
);

/**
 * RAZORPAY WEBHOOK
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // PULL SECRET HERE (At runtime)
  const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const bodyString = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(bodyString)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("[SECURITY FAULT] Invalid Razorpay Signature.");
    return res.status(400).send("Cryptographic signature mismatch.");
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    const userId =
      payload.subscription?.entity?.notes?.firebase_uid ||
      payload.payment?.entity?.notes?.firebase_uid;

    if (!userId) {
      console.error("[DATA FAULT] No Firebase UID attached.");
      return res.status(400).send("Missing Identity Mapping");
    }

    const userRef = db.collection("users").doc(userId);

    switch (event) {
      case "subscription.charged":
      case "subscription.authenticated":
        await userRef.update({
          tier: "PRO",
          proSince: admin.firestore.FieldValue.serverTimestamp(),
          subscriptionId: payload.subscription.entity.id,
        });
        console.log(`[LEDGER UPDATE] User ${userId} upgraded to PRO.`);
        break;

      case "subscription.halted":
      case "subscription.cancelled":
      case "subscription.pending":
        await userRef.update({
          tier: "ESSENTIAL",
          subscriptionId: null,
        });
        console.log(`[LEDGER UPDATE] User ${userId} downgraded to ESSENTIAL.`);
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event}`);
    }

    res.status(200).send("Webhook executed successfully.");
  } catch (error) {
    console.error("[SYSTEM FAULT] Webhook processing failed:", error);
    res.status(500).send("Internal Server Error");
  }
});
