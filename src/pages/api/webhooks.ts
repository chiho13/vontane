import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { Readable } from "node:stream";
// import { prisma } from "@/server/db";
import { stripe } from "@/server/stripe/client";
import { PrismaClient } from "@prisma/client";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import {
  handleInvoicePaid,
  handleSubscriptionCanceled,
  handleSubscriptionCreatedOrUpdated,
} from "@/server/stripe/stripe-webhook-handlers";

import { env } from "@/env.mjs";
// import {
//   upsertProductRecord,
//   upsertPriceRecord,
//   manageSubscriptionStatusChange
// } from '@/utils/supabase-admin';

// Stripe requires the raw body to construct the event.

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable) {
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const supabase = createServerSupabaseClient({
  //     req,
  //     res,
  //   });
  //   const { prisma, supabaseServerClient } = trpcContext;
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated":
            await handleSubscriptionCreatedOrUpdated({
              event,
              prisma,
            });
            break;

          case "customer.subscription.deleted":
            await handleSubscriptionCanceled({
              event,
              prisma,
            });
            break;

          case "invoice.payment_succeeded":
            await handleInvoicePaid({ event, stripe, prisma });
          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.log(error);
        return res
          .status(400)
          .send('Webhook error: "Webhook handler failed. View logs."');
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
