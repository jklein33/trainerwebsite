"use client"

import { useState, useEffect } from "react"
import { EmbeddedCheckout } from "@/components/embedded-checkout"

interface PriceOption {
  priceId: string
  amount: number
  currency: string
  originalAmount: number | null
  interval: string | null
}

interface PricingData {
  oneTime: PriceOption
  monthly: PriceOption | null
}

type Plan = "one-time" | "monthly"

export default function CheckoutPage() {
  const [pricing, setPricing] = useState<PricingData | null>(null)
  const [plan, setPlan] = useState<Plan>("one-time")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [currency, setCurrency] = useState<string>("usd")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  // Fetch prices from Stripe on mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/get-prices')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch prices')
        }

        const data = await response.json()
        setPricing(data)
        setCurrency(data.oneTime.currency)
      } catch (err) {
        console.error('Price fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pricing')
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const selectedPrice =
    plan === "monthly" && pricing?.monthly ? pricing.monthly : pricing?.oneTime ?? null
  const paymentType: "one-time" | "subscription" =
    plan === "monthly" && pricing?.monthly ? "subscription" : "one-time"

  // Initialize payment when pricing loads or the selected plan changes
  useEffect(() => {
    if (!pricing || !selectedPrice) return

    let cancelled = false

    const initializePayment = async () => {
      setClientSecret(null)
      setError(null)
      setLoading(true)

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: selectedPrice.priceId,
            paymentType,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to initialize payment')
        }

        const data = await response.json()
        if (cancelled) return
        setClientSecret(data.clientSecret)
        setCurrency(data.currency)
      } catch (err) {
        if (cancelled) return
        console.error('Payment intent creation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initializePayment()

    return () => {
      cancelled = true
    }
  }, [pricing, selectedPrice, paymentType])

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12 lg:px-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            {/* Left Column: Payment Plans & Checkout Form */}
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-orange-500 mb-2">
                  Dawg Strength (Beta Group)
                </h1>
                <p className="text-red-500 text-lg italic font-semibold">
                  Discounted from $12,000/year
                </p>
              </div>

              {/* Trust Builders - Moved to top */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">What You Get</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Save 5+ hours per week with training programs that deliver results with speed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Effortless nutrition that works—no meal prep stress or guesswork</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Fast-track your results with proven methods, no trial and error</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Peace of mind knowing you&apos;re on the right track, every step of the way</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span>Get results faster with a system that&apos;s already worked for 20+ clients</span>
                  </li>
                </ul>
              </div>

              {pricing && (
                <div className={`grid gap-3 mb-6 ${pricing.monthly ? "sm:grid-cols-2" : ""}`}>
                  <PlanOption
                    label="One-time"
                    detail="One-time fee"
                    amount={pricing.oneTime.amount}
                    currency={pricing.oneTime.currency}
                    originalAmount={pricing.oneTime.originalAmount}
                    selected={plan === "one-time"}
                    onSelect={() => setPlan("one-time")}
                    formatAmount={formatAmount}
                  />
                  {pricing.monthly && (
                    <PlanOption
                      label="Monthly"
                      detail="Billed monthly"
                      amount={pricing.monthly.amount}
                      currency={pricing.monthly.currency}
                      originalAmount={pricing.monthly.originalAmount}
                      cadence="/mo"
                      selected={plan === "monthly"}
                      onSelect={() => setPlan("monthly")}
                      formatAmount={formatAmount}
                    />
                  )}
                </div>
              )}

              {/* Total Due Today Summary */}
              {selectedPrice && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 text-lg font-semibold">Total due today</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {formatAmount(selectedPrice.amount, currency)}
                        {paymentType === "subscription" ? "/mo" : ""}{" "}
                        {currency.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(!pricing || loading) && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <p className="text-gray-300">
                    {!pricing ? 'Loading pricing...' : 'Loading checkout...'}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 rounded-xl p-6 border border-red-800 mb-6">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {clientSecret && !loading && selectedPrice && (
                <EmbeddedCheckout
                  key={clientSecret}
                  clientSecret={clientSecret}
                  amount={selectedPrice.amount}
                  currency={currency}
                  paymentType={paymentType}
                  priceId={selectedPrice.priceId}
                />
              )}
            </div>

            {/* Right Column: Testimonials & Trust Builders */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  See What Our Clients Are Saying
                </h2>
              </div>

              {/* Testimonials */}
              <div className="space-y-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-orange-500 italic mb-4 text-lg font-semibold">
                    &quot;I started my Dawg Strength fitness program a few weeks ago with James Klein. Under his direction, I&apos;ve seen desired weight loss and increased physical endurance. Thanks to James for his patience and instruction. I&apos;m reaching my health goals!&quot;
                  </p>
                  <p className="text-orange-500 font-semibold">— Tom P.</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                  </div>
                  <div className="text-orange-500 italic mb-4 text-lg font-semibold space-y-3">
                    <p>
                      &quot;I&apos;ve had the pleasure of working with James Klein as my coach. He has been an excellent communicator and has a passion for fitness and delivering results. James shows that I am not just another client, but that he cares and wants me to succeed.
                    </p>
                    <p>
                      He shares valuable knowledge on nutrition and supplementation based on facts and evidence of what your individual body needs. While working with James I was able to make quick progress with my squats, as far as form and weight.&quot;
                    </p>
                  </div>
                  <p className="text-orange-500 font-semibold">— Teta L.</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                  </div>
                  <div className="text-orange-500 italic mb-4 text-lg font-semibold space-y-3">
                    <p>
                      &quot;James gave me the confidence and belief in myself to take the first step towards achieving my dream body. He motivated me and gave me hope for success. I trusted the Dawg Strength method and I got the results I wanted.
                    </p>
                    <p>
                      I feel good about myself and now I have the tools to succeed on my own. James cares about me as a person and took joy in watching me succeed, and that was an amazing feeling.&quot;
                    </p>
                  </div>
                  <p className="text-orange-500 font-semibold">— Tracie N.</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                  </div>
                  <div className="text-orange-500 italic mb-4 text-lg font-semibold space-y-3">
                    <p>
                      &quot;Before working with James, I battled chronic back pain, low motivation, and complete uncertainty about where to even begin. As a busy healthcare professional, I needed something realistic and sustainable.
                    </p>
                    <p>
                      James created a completely customized program tailored to my schedule and goals. The results have been transformative—I&apos;m stronger, more confident, and free from constant back pain.
                    </p>
                    <p>
                      What sets James apart is his deep expertise, unwavering accountability, and genuine encouragement. He has helped me stay consistent with both training and nutrition, while pushing me well beyond what I thought I was capable of. Now I actually look forward to my workouts!
                    </p>
                    <p>
                      I wholeheartedly recommend James to anyone serious about making a lasting, positive change to their health and lifestyle.&quot;
                    </p>
                  </div>
                  <p className="text-orange-500 font-semibold">— Hannah M.</p>
                </div>
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

function PlanOption({
  label,
  detail,
  amount,
  currency,
  originalAmount,
  cadence = "",
  selected,
  onSelect,
  formatAmount,
}: {
  label: string
  detail: string
  amount: number
  currency: string
  originalAmount: number | null
  cadence?: string
  selected: boolean
  onSelect: () => void
  formatAmount: (amount: number, currency: string) => string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`text-left rounded-2xl p-6 border transition-colors ${
        selected
          ? "bg-gray-900/80 border-orange-500"
          : "bg-gray-900/50 border-gray-800 hover:border-gray-600"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-white">
          {formatAmount(amount, currency)}
          {cadence}
        </span>
        {originalAmount && (
          <span className="text-lg text-gray-400 line-through">
            {formatAmount(originalAmount, currency)}
            {cadence}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300">{detail}</p>
    </button>
  )
}
