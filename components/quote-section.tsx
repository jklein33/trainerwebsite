import Link from "next/link"
import { Button } from "@/components/ui/button"

export function QuoteSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-black px-6 py-24 lg:px-12">
      <div className="absolute inset-0 opacity-20">
        {/* Placeholder for gym background image */}
        <div className="h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      </div>
      <div className="relative z-10 text-center">
        <blockquote className="mb-12 text-3xl italic leading-relaxed text-white sm:text-4xl lg:text-5xl xl:text-6xl">
          Strength training has taught me the constant pursuit
          <br />
          of self-improvement, resilience, discipline, and
          <br />
          sacrifice.
        </blockquote>
        <Button
          asChild
          variant="ghost"
          className="text-lg font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-600 hover:bg-transparent"
        >
          <Link href="/contact">CONTACT</Link>
        </Button>
      </div>
    </section>
  )
}

