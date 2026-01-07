"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import type { Stripe } from "@stripe/stripe-js"

// Validate environment variable at module load
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!publishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
if (!priceId) {
  console.error('NEXT_PUBLIC_STRIPE_PRICE_ID is not set')
}

let stripePromise: Promise<Stripe | null> | null = null

const getStripe = async (): Promise<Stripe | null> => {
  if (!publishableKey) {
    console.error('Stripe publishable key is missing')
    return null
  }

  if (!stripePromise) {
    stripePromise = import("@stripe/stripe-js").then((stripe) =>
      stripe.loadStripe(publishableKey)
    )
  }
  return stripePromise
}

export function Packages() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!priceId) {
      alert('Payment configuration error. Please contact support.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data?.sessionId) {
        throw new Error('No session ID returned from server')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Failed to initialize payment. Please refresh the page.')
      }

      const { error } = await (stripe as any).redirectToCheckout({ sessionId: data.sessionId })
      
      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="packages" className="bg-black px-6 py-16 lg:px-12 lg:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-4">
            Choose Your Package
          </h2>
          <p className="text-xl text-gray-300">
            Start your transformation today
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-lg max-w-md w-full">
            <CardHeader className="space-y-4">
              <CardTitle className="text-2xl font-bold text-white sm:text-3xl">
                The Dawg Strength Method
              </CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Perfect for gym-goers who will benefit from the guidance and counsel of an experienced fitness professional without the need to have him present as a personal trainer on the gym floor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                  <span className="text-base text-white">Personalized Training Plans</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                  <span className="text-base text-white">Nutritional Advice</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                  <span className="text-base text-white">Access to Exclusive Content</span>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={loading}
                size="lg"
                className="w-full bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-6 rounded-xl font-bold shadow-lg"
              >
                {loading ? 'Processing...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

