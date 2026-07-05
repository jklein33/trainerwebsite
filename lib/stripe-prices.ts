export function getOneTimePriceId(): string {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
  if (!priceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID is not set')
  }
  return priceId
}

export function getSubscriptionPriceId(): string {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID
  if (!priceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID is not set')
  }
  return priceId
}

export function getAllowedPriceIds(): string[] {
  return [getOneTimePriceId(), getSubscriptionPriceId()]
}
