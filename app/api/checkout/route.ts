import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

// Allowed price IDs for security (validate against your actual prices)
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

    // Get origin from request URL for better reliability
    const origin = request.headers.get('origin') || request.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#packages`,
      metadata: {
        product_name: 'Dawg Strength Program',
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // Provide more specific error messages
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

