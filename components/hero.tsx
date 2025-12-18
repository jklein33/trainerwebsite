import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center bg-black px-6 lg:px-12">
      <div className="container mx-auto grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-8 pt-20 lg:pt-0">
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
        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="relative h-[600px] w-full max-w-md overflow-hidden rounded-lg sm:h-[700px] lg:h-[800px] xl:h-[900px] bg-black">
            <Image
              src="/images/james_pose.jpg"
              alt="Coach posing and flexing muscles at Dawg Strength"
              fill
              priority
              className="object-contain object-center"
              sizes="(min-width: 1024px) 500px, 70vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

