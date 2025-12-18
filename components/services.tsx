"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Monitor, User } from "lucide-react"

const services = [
  {
    icon: Monitor,
    title: "The Dawg Strength Method",
    description: "Perfect for gym-goers who will benefit from the guidance and counsel of an experienced fitness professional without the need to have him present as a personal trainer on the gym floor.",
    features: [
      "Personalized Training Plans",
      "Nutritional Advice",
      "Access to Exclusive Content",
    ],
  },
  {
    icon: User,
    title: "Personal Training (VA Locals only)",
    description: "Traditional boots on the ground personal training in the gym twice a week for eight weeks. Designed for those becoming more comfortable in the gym and making it a habit.",
    features: [
      "Structured Workout Routines",
      "Direct Supervision",
      "Immediate Feedback",
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
              <Card key={index} className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="space-y-4">
                  <div className="mb-2">
                    <Icon className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white sm:text-2xl">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

