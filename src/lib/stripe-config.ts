// Display copy only. Checkout ignores this file and uses STRIPE_PRO_PRICE_ID
// on the server. The previous price id remains accepted for historical
// fulfillment in supabase/functions/_shared/entitlement.ts.
export const STRIPE_CONFIG = {
  pro: {
    product_id: "prod_UI9akocWgEoW84",
    price_id: "price_1UMt4LByiix0wtyT4iQ0dYbc",
    name: "PlantasticHaven Pro",
    price: "$7.99",
    priceAmount: 799,
  },
} as const;
