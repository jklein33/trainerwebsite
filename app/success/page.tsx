import { Button } from "@/components/ui/button"
import Link from "next/link"
import Stripe from "stripe"

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    session_id?: string
    payment_intent?: string
    payment_intent_client_secret?: string
    redirect_status?: string
  }>
}) {
  const params = await searchParams
  const sessionId = params.session_id
  const paymentIntentId = params.payment_intent
  const redirectStatus = params.redirect_status

  let paymentStatus: 'success' | 'unknown' = 'unknown'
  let paymentDetails: { amount?: number; currency?: string } = {}

  // Verify payment intent if present
  if (paymentIntentId) {
    try {
      const stripe = getStripe()
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status === 'succeeded' || redirectStatus === 'succeeded') {
        paymentStatus = 'success'
        paymentDetails = {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }
      }
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
    }
  }

  // Verify checkout session if present
  if (sessionId && paymentStatus === 'unknown') {
    try {
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status === 'paid') {
        paymentStatus = 'success'
        paymentDetails = {
          amount: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
        }
      }
    } catch (error) {
      console.error('Error retrieving checkout session:', error)
    }
  }

  const formatAmount = (amount: number | undefined, currency: string | undefined) => {
    if (!amount || !currency) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {paymentStatus === 'success' ? (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-300">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            {paymentDetails.amount && paymentDetails.currency && (
              <p className="text-lg text-orange-500 font-semibold">
                {formatAmount(paymentDetails.amount, paymentDetails.currency)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Payment Status Unknown
            </h1>
            <p className="text-xl text-gray-300">
              Please check your email for payment confirmation or contact support if you have questions.
            </p>
          </div>
        )}
        <Link href="/">
          <Button
            size="lg"
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-6 rounded-xl font-bold shadow-lg"
          >
            Return Home
          </Button>
        </Link>
      </div>
    </main>
  )
}


