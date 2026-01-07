"use client"

import { useState, useEffect } from "react"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!publishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

const stripePromise = publishableKey ? loadStripe(publishableKey) : null

interface EmbeddedCheckoutProps {
  clientSecret: string
  amount: number
  currency: string
  paymentType?: 'one-time' | 'subscription'
  priceId?: string
  onSuccess?: () => void
}

function CheckoutForm({ clientSecret, amount, currency, paymentType = 'one-time', priceId, onSuccess }: EmbeddedCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')

  const paymentElementOptions = {
    fields: {
      billingDetails: 'auto' as const,
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    // Validate email is provided
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'An error occurred')
      setLoading(false)
      return
    }

    // Handle subscription payments
    if (paymentType === 'subscription' && priceId) {
      try {
        // Confirm setup intent to get payment method
        // Note: Many alternative payment methods (Klarna, Affirm, etc.) don't support subscriptions
        // Only card and some bank transfer methods work with recurring subscriptions
        const { error: setupError, setupIntent } = await stripe.confirmSetup({
          elements,
          clientSecret,
          redirect: 'if_required',
        })

        if (setupError) {
          setError(setupError.message || 'Payment setup failed')
          setLoading(false)
          return
        }

        if (setupIntent?.payment_method) {
          // Create subscription with email
          const response = await fetch('/api/create-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId,
              paymentMethodId: setupIntent.payment_method,
              customerEmail: email,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to create subscription')
          }

          const data = await response.json()

          // If there's a payment intent (for first payment), confirm it
          if (data.clientSecret) {
            const { error: paymentError } = await stripe.confirmPayment({
              clientSecret: data.clientSecret,
              redirect: 'if_required',
            })

            if (paymentError) {
              setError(paymentError.message || 'Payment failed')
              setLoading(false)
              return
            }
          }

          // Redirect to success page
          window.location.href = '/success'
        }
      } catch (err) {
        console.error('Subscription error:', err)
        setError(err instanceof Error ? err.message : 'Failed to process subscription')
        setLoading(false)
        return
      }
    } else {
      // Handle one-time payments
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          payment_method_data: {
            billing_details: {
              email: email,
            },
          },
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
      } else {
        if (onSuccess) {
          onSuccess()
        }
      }
    }

    setLoading(false)
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h3>
          <p className="text-lg text-gray-300">
            Total: <span className="text-orange-500 font-bold">{formatAmount(amount, currency)}</span>
          </p>
        </div>
        
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
          <PaymentElement options={paymentElementOptions} />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || loading}
          size="lg"
          className="w-full bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-6 rounded-xl font-bold shadow-lg"
        >
          {loading ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
        </Button>
      </div>
    </form>
  )
}

export function EmbeddedCheckout({ clientSecret, amount, currency, paymentType = 'one-time', priceId, onSuccess }: EmbeddedCheckoutProps) {
  if (!stripePromise) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <p className="text-red-300">Stripe is not configured. Please check your environment variables.</p>
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#f97316', // orange-500
        colorBackground: '#111827', // gray-900
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        amount={amount} 
        currency={currency}
        paymentType={paymentType}
        priceId={priceId}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}

