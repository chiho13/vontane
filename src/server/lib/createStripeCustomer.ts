import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function createStripeCustomerIfNeeded(prisma, user) {
  if (!user.stripe_id) {
    const customer = await stripe.customers.create({ email: user.email });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { stripe_id: customer.id },
    });

    return updatedUser;
  }

  return user;
}

export async function fetchProducts() {
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
