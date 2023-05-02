import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { Readable } from "node:stream";

import { stripe } from "@/server/lib/stripeHelpers";
import { PrismaClient } from "@prisma/client";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createInnerTRPCContext } from "@/server/api/trpc";

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
  const chunks = [];
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
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  // const supabase = createServerSupabaseClient({
  //     req,
  //     res,
  //   });
  const trpcContext = createInnerTRPCContext({}, req, res);
  //   const { prisma, supabaseServerClient } = trpcContext;

  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ??
      process.env.STRIPE_WEBHOOK_SECRET;
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
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            // await manageSubscriptionStatusChange(
            //   subscription.id,
            //   subscription.customer as string,
            //   event.type === 'customer.subscription.created'
            // );

            if (
              subscription.status === "canceled" ||
              subscription.status === "past_due"
            ) {
              await prisma.user.update({
                where: {
                  stripe_id: subscription.customer as string,
                },
                data: {
                  is_subscribed: false,
                },
              });
            }
            break;
          case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data.object;
            console.log(paymentIntentSucceeded);
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            console.log(checkoutSession);
            if (checkoutSession.mode === "subscription") {
              await prisma.user.update({
                where: {
                  stripe_id: checkoutSession.customer as string,
                },
                data: {
                  is_subscribed: true,
                },
              });
            }
            break;
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
