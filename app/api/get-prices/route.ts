import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOneTimePriceId, getSubscriptionPriceId } from '@/lib/stripe-prices'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

const ONETIME_PRICE_ID = getOneTimePriceId()

function toPriceOption(priceId: string, price: Stripe.Price) {
  return {
    priceId,
    amount: price.unit_amount || 0,
    currency: price.currency,
    originalAmount: price.metadata?.original_amount
      ? parseInt(price.metadata.original_amount, 10)
      : null,
    interval: price.recurring?.interval ?? null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe()
    const oneTimePrice = await stripe.prices.retrieve(ONETIME_PRICE_ID)

    let monthly = null
    try {
      const monthlyPriceId = getSubscriptionPriceId()
      const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId)
      monthly = toPriceOption(monthlyPriceId, monthlyPrice)
    } catch (error) {
      console.error('Monthly price fetch error:', error)
    }

    return NextResponse.json({
      oneTime: toPriceOption(ONETIME_PRICE_ID, oneTimePrice),
      monthly,
    })
  } catch (error) {
    console.error('Price fetch error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
