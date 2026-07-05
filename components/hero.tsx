import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function Hero() {
  return (
    <section id="hero" className="relative bg-black px-6 pt-4 lg:px-12 lg:pt-6 overflow-hidden py-12 flex items-start">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/ambitious-studio-rick-barrett-wZlsHihO2g4-unsplash.jpg"
          alt="Gym background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>
      
      <div className="container mx-auto grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:items-start relative z-10 w-full pt-12 pb-12">
        {/* Left Content */}
        <div className="flex flex-col space-y-8">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Do you have that Dawg in you?
          </h1>
          <p className="text-lg text-white sm:text-xl lg:text-2xl">
            Become the excellent man you were born to be.
          </p>
          <Link href="/dawg-strength-program">
            <Button 
              size="lg" 
              className="w-fit bg-orange-500 text-white hover:bg-orange-600 text-base sm:text-lg px-8 py-6 rounded-lg font-medium shadow-lg"
            >
              Find the Dawg
            </Button>
          </Link>
          <div className="flex flex-col gap-4 pt-6">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 flex-shrink-0 text-orange-500" />
              <span className="text-base text-white sm:text-lg">20+ clients</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 flex-shrink-0 text-orange-500" />
              <span className="text-base text-white sm:text-lg">7 years of experience</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 flex-shrink-0 text-orange-500" />
              <span className="text-base text-white sm:text-lg">1+ years of competitions</span>
            </div>
          </div>
        </div>
        
        {/* Right Image */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/athena_dawg.jpeg"
              alt="Coach posing and flexing muscles at Dawg Strength"
              fill
              priority
              className="object-cover object-center rounded-2xl"
              sizes="(min-width: 1024px) 400px, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

