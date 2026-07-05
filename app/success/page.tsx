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
      <div className="max-w-2xl w-full text-center space-y-8">
        {paymentStatus === 'success' ? (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Payment Successful!
            </h1>
            <div className="space-y-4 text-left">
              <p className="text-4xl text-gray-300">
                Hello! Thank you for purchasing the Dawg Strength Program Beta Group.
              </p>
              <p className="text-lg text-orange-400 font-bold">
                You will receive a series of emails shortly of documents that will need signatures before login information is provisioned.
              </p>
              <p className="text-2xl text-gray-300">
                Since you are part of the beta group, you understand that the course materials are not completely built out yet. In the meantime, you will have access to our discord group, weekly group calls and module 1: Dawg Mindset, will be added shortly. Expect to have everything in the next 6-8 weeks.
              </p>
            </div>
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


