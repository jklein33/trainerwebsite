import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

// Price IDs
const ONETIME_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1Smi6GKx2xkrGl8oaMCLcwNM'
const SUBSCRIPTION_PRICE_ID = 'price_1SmwLNKx2xkrGl8olwl91cwM'

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe()
    
    // Fetch both prices from Stripe
    const [oneTimePrice, subscriptionPrice] = await Promise.all([
      stripe.prices.retrieve(ONETIME_PRICE_ID),
      stripe.prices.retrieve(SUBSCRIPTION_PRICE_ID),
    ])

    // Calculate subscription totals
    const subscriptionMonthlyAmount = subscriptionPrice.unit_amount || 0
    const subscriptionIntervalCount = subscriptionPrice.recurring?.interval_count || 1
    const subscriptionTotalAmount = subscriptionMonthlyAmount * 12 // Assuming 12 months

    return NextResponse.json({
      oneTime: {
        priceId: ONETIME_PRICE_ID,
        amount: oneTimePrice.unit_amount || 0,
        currency: oneTimePrice.currency,
        // If you have original/discounted prices, you can add metadata or calculate here
        originalAmount: oneTimePrice.metadata?.original_amount 
          ? parseInt(oneTimePrice.metadata.original_amount) 
          : null,
      },
      subscription: {
        priceId: SUBSCRIPTION_PRICE_ID,
        monthlyAmount: subscriptionMonthlyAmount,
        currency: subscriptionPrice.currency,
        interval: subscriptionPrice.recurring?.interval || 'month',
        intervalCount: subscriptionIntervalCount,
        totalAmount: subscriptionTotalAmount,
        // If you have original/discounted prices, you can add metadata or calculate here
        originalMonthlyAmount: subscriptionPrice.metadata?.original_monthly_amount
          ? parseInt(subscriptionPrice.metadata.original_monthly_amount)
          : null,
        originalTotalAmount: subscriptionPrice.metadata?.original_total_amount
          ? parseInt(subscriptionPrice.metadata.original_total_amount)
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

