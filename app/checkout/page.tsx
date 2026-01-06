"use client"

import { useState, useEffect } from "react"
import { EmbeddedCheckout } from "@/components/embedded-checkout"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("usd")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

  useEffect(() => {
    if (!priceId) {
      setError('Payment configuration error. Please contact support.')
      setLoading(false)
      return
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to initialize payment')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setAmount(data.amount)
        setCurrency(data.currency)
      } catch (err) {
        console.error('Payment intent creation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [priceId])

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12 lg:px-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            {/* Left Column: Checkout Form */}
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Complete Your Purchase
                </h1>
                <p className="text-xl text-gray-300">
                  Join the DAWG Strength Program and transform your life
                </p>
              </div>

              {loading && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <p className="text-gray-300">Loading checkout...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 rounded-xl p-6 border border-red-800 mb-6">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {clientSecret && !loading && (
                <EmbeddedCheckout
                  clientSecret={clientSecret}
                  amount={amount}
                  currency={currency}
                />
              )}
            </div>

            {/* Right Column: Testimonials & Trust Builders */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Join Hundreds of Successful Clients
                </h2>
              </div>

              {/* Testimonials */}
              <div className="space-y-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <p className="text-white italic mb-4 text-lg">
                    &quot;I lost 25 pounds and built a physique I&apos;m proud of. The confidence I gained translated directly to my work—I went from being overlooked for promotions to leading major projects. The results are real.&quot;
                  </p>
                  <p className="text-orange-500 font-semibold">— Senior Data Engineer</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <p className="text-white italic mb-4 text-lg">
                    &quot;After losing 20 pounds and building a fit body, I finally have the confidence to speak up in meetings, negotiate better salaries, and take on bigger challenges. The transformation gave me that edge.&quot;
                  </p>
                  <p className="text-orange-500 font-semibold">— Software Architect</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <p className="text-white italic mb-4 text-lg">
                    &quot;The DAWG method saved me hours every week. I&apos;m in the best shape of my life and more productive at work than ever. Best investment I&apos;ve made in myself.&quot;
                  </p>
                  <p className="text-orange-500 font-semibold">— Product Manager</p>
                </div>
              </div>

              {/* Trust Builders */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">What You Get</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Personalized training plans tailored to your schedule</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Nutrition guidance that fits your lifestyle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Access to exclusive content and resources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Ongoing support and accountability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Proven system used by 20+ successful clients</span>
                  </li>
                </ul>
              </div>

              {/* Security Badge */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-gray-400 text-sm">
                  🔒 Secure payment powered by Stripe. Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

