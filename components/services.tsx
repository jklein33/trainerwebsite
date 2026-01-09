"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Monitor, User } from "lucide-react"

const services = [
  {
    icon: Monitor,
    title: "The Dawg Strength Method",
    description: "The Ultimate Program for Busy IT Professionals who want to lose 30+ pounds, without wasting time in the gym and kitchen.",
    features: [
      "Effortless Nutrition",
      "Efficient Training Programs",
      "Access to Exclusive Content",
      "Network and community of like-minded individuals",
    ],
  },
  {
    icon: User,
    title: "Personal Training (VA Locals only)",
    description: "In person training for those who prefer the personal touch of a coach in the gym.",
    features: [
      "Transform your body faster and reach your goals in record time",
      "Build the strength and physique you've always wanted without setbacks",
      "See visible results week after week with guaranteed progress",
      "Achieve your dream body with the consistency that actually works",
    ],
  },
]

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-black px-6 py-24 lg:px-12">
      <div className="absolute inset-0">
        <Image
          src="/images/ambitious-studio-rick-barrett-aw9cszR7FGU-unsplash.jpg"
          alt="Gym floor with equipment background"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-500 sm:text-sm">
            SERVICES
          </p>
          <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Let&apos;s get you your dream body!
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-lg flex flex-col">
                <CardHeader className="space-y-4">
                  <div className="mb-2">
                    <Icon className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col flex-grow">
                  <CardDescription className="text-base leading-relaxed text-gray-300">
                    {service.description}
                  </CardDescription>
                  <div className="flex flex-col gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                        <span className="text-base text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-4">
                    {index === 0 ? (
                      <Link href="/dawg-strength-program">
                        <Button 
                          size="lg" 
                          className="w-full bg-orange-500 text-white hover:bg-orange-600 text-base sm:text-lg px-8 py-6 rounded-lg font-medium shadow-lg"
                        >
                          Find the Dawg
                        </Button>
                      </Link>
                    ) : (
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <Button 
                          size="lg" 
                          className="w-full bg-orange-500 text-white hover:bg-orange-600 text-base sm:text-lg px-8 py-6 rounded-lg font-medium shadow-lg"
                        >
                          Start Training
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

