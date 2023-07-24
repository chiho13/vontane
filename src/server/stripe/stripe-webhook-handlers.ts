import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const createStripeCustomerIfNeeded = async ({
  stripe,
  prisma,
  userId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("User not found");

  if (user.stripe_id) {
    return user.stripe_id;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal user id
    metadata: {
      userId,
    },
  });

  // update with new customer id
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripe_id: customer.id,
    },
  });

  if (updatedUser.stripe_id) {
    return updatedUser.stripe_id;
  }
};

export async function fetchProducts({ stripe }: { stripe: Stripe }) {
  const products = await stripe.products.list();
  const prices = await stripe.prices.list();

  const productsWithPrices = products.data.map((product) => {
    const productPrices = prices.data.filter(
      (price) => price.product === product.id
    );
    return { ...product, prices: productPrices };
  });

  return productsWithPrices;
}

export const handleInvoicePaid = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription;
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  );

  // update user with subscription data
  await prisma.user.update({
    where: {
      stripe_id: subscription.customer as string,
    },
    data: {
      is_subscribed: true,
      stripeSubscriptionId: subscription.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
};

export const handleSubscriptionCreatedOrUpdated = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(subscription);
  // update user with subscription data
  await prisma.user.update({
    where: {
      stripe_id: subscription.customer as string,
    },
    data: {
      is_subscribed: true,
      stripeSubscriptionId: subscription.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
};

export const handleSubscriptionCanceled = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;

  // remove subscription data from user
  await prisma.user.update({
    where: {
      stripe_id: subscription.customer as string,
    },
    data: {
      is_subscribed: false,
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
    },
  });
};

export const handlePaymentSucceeded = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  const charge = event.data.object as Stripe.Charge;

  // You might want to use charge.metadata or charge.customer to retrieve
  // the user associated with this payment, depending on how you've set up your Stripe integration

  // Add the payment amount (converted to credits) to the user's balance.
  const credits = Number(charge.metadata.credits);

  await prisma.user.update({
    where: { stripe_id: charge.customer as string },
    data: { credits: { increment: credits } },
  });
};
