"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function AboutSection() {
  return (
    <section id="about" className="bg-black px-6 py-24 lg:px-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src="/images/classic_stage.jpg"
                alt="James on competition stage"
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
          
          {/* Right Content */}
          <div className="flex flex-col justify-center space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 sm:text-sm">
              ABOUT JAMES
            </p>
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Head Coach
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-white sm:text-lg">
              <p>
                James started as a fat guy who wanted to get in shape. After years of playing hockey and lacrosse, he struggled to stay fit. That&apos;s when he discovered powerlifting and bodybuilding, which changed his life completely.
              </p>
              <p>
                Having worked a 9-to-5 job in Data Consulting, James understands the challenges of fitting fitness into a busy schedule. His mission is to help and inspire others to become the best version of themselves, just as he did.
              </p>
            </div>
            {/* <Button 
              size="lg" 
              className="w-fit bg-orange-500 text-white hover:bg-orange-600 text-base sm:text-lg px-8 py-6 rounded-lg font-medium shadow-lg"
            >
              Book a session
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  )
}

