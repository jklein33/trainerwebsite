import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

// Allowed price IDs for security
const ALLOWED_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
].filter(Boolean) as string[]

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json()

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json(
        { error: 'Valid price ID is required' },
        { status: 400 }
      )
    }

    // Validate price ID against allowed list for security
    if (ALLOWED_PRICE_IDS.length > 0 && !ALLOWED_PRICE_IDS.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Get the price to determine the amount
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price || !price.unit_amount) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      )
    }

    // Get origin from request URL
    const origin = request.headers.get('origin') || request.nextUrl.origin

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      metadata: {
        price_id: priceId,
        product_name: 'Dawg Strength Program',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
      currency: price.currency,
    })
  } catch (error) {
    console.error('Payment Intent creation error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

