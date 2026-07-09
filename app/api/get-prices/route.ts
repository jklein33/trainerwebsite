import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOneTimePriceId } from '@/lib/stripe-prices'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

const ONETIME_PRICE_ID = getOneTimePriceId()

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe()
    const oneTimePrice = await stripe.prices.retrieve(ONETIME_PRICE_ID)

    return NextResponse.json({
      oneTime: {
        priceId: ONETIME_PRICE_ID,
        amount: oneTimePrice.unit_amount || 0,
        currency: oneTimePrice.currency,
        originalAmount: oneTimePrice.metadata?.original_amount 
          ? parseInt(oneTimePrice.metadata.original_amount) 
          : null,
      },
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
