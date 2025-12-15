"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const stories = [
  {
    name: "Anna Taylor",
    duration: "12-month transformation",
    description: "A year ago, Anna approached me with the goal of simultaneously losing fat and building muscle.",
  },
  {
    name: "Philip Wang",
    duration: "18-month transformation",
    description: "Philip aimed to lose fat and build muscle. With determination and a solid plan, he succeeded remarkably.",
  },
  {
    name: "Jack Smith",
    duration: "2-year transformaton",
    description: "Jack aspired to a shredded, muscular body. Through dedication and hard work, he made it a reality.",
  },
]

export function ClientStories() {
  return (
    <section id="client-stories" className="bg-black px-6 py-24 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-500 sm:text-sm">
            CLIENT STORIES
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Results speak for themselves
          </h2>
        </div>
        <div className="relative w-full py-8 overflow-visible">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {stories.map((story, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-[85%] lg:basis-[70%]">
                  <Card className="border-none bg-white shadow-xl">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 gap-0">
                        {/* Before Image */}
                        <div className="relative aspect-square overflow-hidden rounded-tl-lg">
                          <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-400" />
                        </div>
                        {/* After Image */}
                        <div className="relative aspect-square overflow-hidden rounded-tr-lg">
                          <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-700" />
                        </div>
                      </div>
                      <div className="space-y-4 p-6">
                        <p className="text-sm font-semibold uppercase text-gray-600">{story.duration}</p>
                        <p className="text-base leading-relaxed text-gray-800">
                          {story.description}
                        </p>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                          <span className="text-base font-medium text-gray-900">
                            <span className="mr-2 inline-block h-0.5 w-8 bg-orange-500" />
                            {story.name}
                          </span>
                          <Link
                            href="#"
                            className="flex items-center gap-1 text-sm font-medium text-gray-900 transition-colors hover:text-orange-500"
                          >
                            Read more
                            <ArrowRight className="h-4 w-4 text-orange-500" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full border-none bg-orange-500 text-white shadow-xl hover:bg-orange-600 lg:left-4" />
            <CarouselNext className="absolute right-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full border-none bg-orange-500 text-white shadow-xl hover:bg-orange-600 lg:right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}

