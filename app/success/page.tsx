import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id || null

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {sessionId ? (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-300">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
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


