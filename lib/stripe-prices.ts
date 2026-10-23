export function getOneTimePriceId(): string {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
  if (!priceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID is not set')
  }
  return priceId
}

const DEFAULT_SUBSCRIPTION_PRICE_ID = 'price_1Tps7bKx2xkrGl8oS1hqRUtx'

export function getSubscriptionPriceId(): string {
  return process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID || DEFAULT_SUBSCRIPTION_PRICE_ID
}

export function getAllowedPriceIds(): string[] {
  return [getOneTimePriceId(), getSubscriptionPriceId()]
}
