import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

// Allowed price IDs for security
const ALLOWED_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID, // One-time price
  'price_1SmwLNKx2xkrGl8olwl91cwM', // Subscription price
].filter(Boolean) as string[]

export async function POST(request: NextRequest) {
  try {
    const { priceId, paymentType } = await request.json()

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

    // Get the price to determine the amount and type
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      )
    }

    // Get origin from request URL
    const origin = request.headers.get('origin') || request.nextUrl.origin

    // Handle subscription payments
    if (price.recurring || paymentType === 'subscription') {
      // Create a Setup Intent for subscription with automatic payment methods
      const setupIntent = await stripe.setupIntents.create({
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always',
        },
        metadata: {
          price_id: priceId,
          product_name: 'Dawg Strength Program',
          payment_type: 'subscription',
        },
      })

      return NextResponse.json({ 
        clientSecret: setupIntent.client_secret,
        amount: price.unit_amount || 0,
        currency: price.currency,
        paymentType: 'subscription',
        priceId: priceId,
      })
    }

    // Handle one-time payments
    if (!price.unit_amount) {
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      metadata: {
        price_id: priceId,
        product_name: 'Dawg Strength Program',
        payment_type: 'one-time',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: undefined, // Will be collected from PaymentElement
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
      currency: price.currency,
      paymentType: 'one-time',
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

