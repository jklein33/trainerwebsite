"use client"

import Image from "next/image"
import { CalendlyEmbed } from "@/components/calendly-embed"

export default function PersonalTraining() {
  return (
    <main className="min-h-screen bg-black">
      {/* SIMPLE HERO */}
      <section className="relative overflow-hidden bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/The-Shop-Gym-Manassas-Thumbnail-rfnftcpbg5trizwuo2j31gt1fqgotqa7s9yspym148.jpg"
            alt="The Shop Gym in Manassas, VA"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Headline Content */}
            <div className="space-y-6">
              <p className="text-lrg font-semibold uppercase tracking-[0.3em] text-orange-500">
                Personal Training · VA Locals Only
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                One-on-one personal training to get you strong, confident, and injury‑resilient.
              </h1>
              <p className="text-lg leading-relaxed text-gray-300 sm:text-xl">
                I help people get stronger, leaner, and more confident in the gym and in life.
                I specialize in fat loss, stength training, lacrosse and hockey training, general athletic performance and assisted stretching.
              </p>
              <p className="text-base text-orange-400 font-bold">
                Want to see if we&apos;re a fit? Book a quick intro call and we&apos;ll walk through your
                goals, training history, and schedule.
              </p>
              <p className="text-lrg text-white-400 font-semibold">
                I am located at The Shop in Manassas, VA (and can also train out of The Shop in Ashburn, VA) and am available to travel to your location for an additional fee.
              </p>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/mike_pt2.png"
                  alt="In-person personal training session with dumbbells"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT SESSIONS LOOK LIKE */}
      <section className="bg-black px-6 py-16 pb-20 lg:px-12 lg:py-24 lg:pb-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              What training with me looks like
            </h2>
            <p className="mt-4 text-sm text-gray-400 sm:text-base">
              Real clients. Real sessions. Heavy weights, clean form, and focused coaching.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-900">
              <Image
                src="/images/IMG_2103.jpeg"
                alt="Coaching a client on a machine in the gym"
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-900">
              <Image
                src="/images/mike_pt.png"
                alt="Personal training client performing dumbbell press"
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-900">
              <Image
                src="/images/mike_pt2.png"
                alt="Focused coaching in the weight room"
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / INTRO CALL */}
      <section
        id="pt-contact"
        className="bg-black px-6 pb-24 pt-8 lg:px-12 lg:pb-32"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Schedule an intro PT call
            </h2>
            <p className="mt-4 text-base text-gray-300 sm:text-lg">
              Book a quick 20-minute call to discuss your goals, training history, and see if we&apos;re a good fit.
            </p>
            {/* <p className="mt-3 text-sm text-gray-500">
              No pressure, no hard pitch—just a straightforward conversation about your goals and
              what working together would look like.
            </p> */}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl backdrop-blur sm:p-8">
            <CalendlyEmbed url="https://calendly.com/james-dawgstrength/intro-to-personal-training-with-james" />
          </div>
        </div>
      </section>
    </main>
  )
}
