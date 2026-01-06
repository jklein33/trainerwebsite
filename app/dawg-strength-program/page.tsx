import Image from "next/image"
import { CheckoutButton } from "@/components/checkout-button"

export default function DawgStrengthProgram() {
  return (
    <main className="min-h-screen bg-black">
      {/* SECTION 1: ACTION TAKING HEADLINE */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Headline Content */}
            <div className="space-y-8">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Shred that dreaded 30 lbs without wasting a minute.
              </h1>
              <p className="text-xl leading-relaxed text-gray-300 sm:text-2xl">
                The only program designed for busy IT professionals who want to lose 30+ pounds, without wasting time in the gym and kitchen.
              </p>
            </div>
            
            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/classic_stage.jpg"
                  alt="James - competitive bodybuilder and successful IT professional"
                  fill
                  className="object-contain object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ACTION TAKER BUTTON */}
      <section className="bg-black px-6 py-8 lg:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <CheckoutButton 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            Let's Go
          </CheckoutButton>
        </div>
      </section>

      {/* SPACER */}
      <div className="h-16"></div>

      {/* SECTION 3: EMOTION SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          {/* Emotion Driven Headline */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">
              Bring peace to your routine in just 4 weeks.
            </h2>
          </div>

          {/* Transformational Story */}
          <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed">
            <p className="text-4xl text-gray-300">
              <span className="text-orange-400 italic font-semibold">Envision the Peace</span> – Challenges were part of daily life as a product management analyst at HP.
            </p>

            <p className="text-3xl text-gray-300 italic">
              When a project felt like it was about to swallow me whole, I headed to the gym to clear my mind.
            </p>

            <p className="text-2xl text-gray-300 font-semibold">
              In the midst of heavy lifting, my brain found clarity.
            </p>

            <p className="text-lg text-gray-300">
              Solutions appeared. Problems were solved with ease.
            </p>

            <p className="text-2xl text-gray-300">
              I became a machine - both at work and with my physical fitness.
            </p>

            <p className="text-3xl text-gray-300 font-semibold text-white">
              Succeeding on all levels.
            </p>

            <p className="text-2xl text-gray-300 italic text-orange-400 mt-8">
              It wasn&apos;t always this way, though.
            </p>

            {/* Small Image - Adjust size by changing max-w-lg (options: max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl) */}
            <div className="my-8 max-w-4xl mx-auto">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
              <Image
                src="/images/hpe_intern.JPG"
                alt="James at Hewlett Packard Enterprise"
                fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
              />
              </div>
            </div>

            <p className="text-5xl text-gray-300 font-semibold">
              Fitness and nutrition used to be overwhelming - So much time wasted.
            </p>

            <p className="text-xl text-gray-300">
              It took me 7 years to find what actually worked for me as an IT professional attempting to balance both career and wellness.
            </p>

            <p className="text-3xl text-gray-400 font-semibold text-orange-400">
              The DAWG method is what I wish I&apos;d had for myself - a proven, curated system to give you back your body, your brain and your productivity in record time.
            </p>
          </div>

          {/* Action Button - Emotionally Driven */}
          <div className="mt-12 text-center">
            <CheckoutButton 
              size="lg" 
              className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
            >
              Choose Peace of Mind
            </CheckoutButton>
          </div>
        </div>
      </section>

      {/* SPACER */}
      <div className="h-16"></div>

      {/* SECTION 4: FAQ SECTION - VALUE DRIVEN */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                How long will it take me to see results?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                The truth is, I don&apos;t know how long it&apos;s going to take <span className="text-white font-semibold italic">you</span> to get results—because that depends on you. I know this program is proven to work within 4 weeks when students take action decisively. <span className="text-white font-semibold">Are you willing to become the person who takes action and sticks to it?</span>
              </p>
            </div>

            {/* Giphy Image */}
            <div className="text-center py-4">
              <div className="relative max-w-xl mx-auto aspect-square overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/Backdoublebiceps.gif"
                  alt="Bodybuilding pose"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Maybe I should try to get in shape on my own before I try this program?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-4 underline">
                DAWG Strength is for men who value time and want results now.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6 italic">
                Those men aren&apos;t willing to waste any time &quot;figuring it out,&quot; because they know it comes at a cost - to them, to their families and to their productivity at work. 
              </p>
              <p className="text-lg text-orange-500 leading-relaxed mb-4 font-semibold">
                Most people who want to do it on their own are just scared that they won&apos;t get results from their investment - and that makes total sense.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-3">
                Ask yourself these questions:
              </p>
              <ul className="text-lg text-gray-300 leading-relaxed space-y-2 list-disc list-inside ml-4">
                <li>Do you make good decisions, generally?</li>
                <li>What would it take to trust yourself?</li>
                <li>Can you imagine how you&apos;ll show up differently when you&apos;ve made an investment in your health versus doing it alone?</li>
                <li>How would it feel to allow yourself to be supported, the same way you support others?</li>
              </ul>
            </div>

            {/* Giphy Image - Adjust size by changing max-w-xl (options: max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-4xl) */}
            <div className="text-center py-4">
              <div className="relative max-w-5xl mx-auto aspect-video overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/incorrectexercise.gif"
                  alt="Squat exercise demonstration"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                The investment is kind of steep. Are there any other options for working with you?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                DAWG Strength is the whole solution to help you lose 30 lbs without wasting time, so it&apos;s the only option for working with me virtually.
              </p>
              <p className="text-lg font-semibold text-gray-300 leading-relaxed mb-4 italic underline">
                No one ever budgets for a coaching program.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                The men who join DAWG Strength are problem solvers who find a way to budget and make sacrifices for the program.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed mb-4 font-semibold">
                And many find they earn the money back on the back end because they&apos;re more productive at work, more likely to apply for promotions and have more confidence in themselves chasing lucrative opportunities.
              </p>
              <p className="text-2xl text-gray-300 leading-relaxed font-semibold text-orange-400">
                The real question is - if you knew you&apos;d lose 30 lbs in 4-6 months, would the result be worth the investment?
              </p>
            </div>

            {/* Giphy Image */}
            <div className="text-center py-4">
              <div className="relative max-w-2xl mx-auto aspect-square overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/squat.gif"
                  alt="Squat exercise demonstration"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                What exactly is the DAWG Strength method?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                A combination of proven nutrition strategies and time-saving workouts, blended with innovative mindset training, organization strategies, biohacking protocols and more.
              </p>
            </div>

             {/* Giphy Image - Adjust size by changing max-w-xl (options: max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-4xl) */}
             <div className="text-center py-4">
              <div className="relative max-w-6xl mx-auto aspect-video overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/logpress.gif"
                  alt="Squat exercise demonstration"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                Can I talk to James before Joining the program?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Yes, click this link to schedule an info call with James.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-12 text-center">
          <CheckoutButton 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
              GET THE COMPLETE SOLUTION
          </CheckoutButton>
          </div>
        </div>
      </section>

      {/* SPACER */}
      <div className="h-16"></div>

      {/* SECTION 5: AUTHORITY BUILDER TESTIMONIALS */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <p className="text-white italic mb-4 text-lg">
                &quot;I lost 25 pounds and built a physique I&apos;m proud of. The confidence I gained translated directly to my work—I went from being overlooked for promotions to leading major projects. The results are real.&quot;
              </p>
              <p className="text-orange-500 font-semibold">— Senior Data Engineer</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <p className="text-white italic mb-4 text-lg">
                &quot;After losing 20 pounds and building a fit body, I finally have the confidence to speak up in meetings, negotiate better salaries, and take on bigger challenges. The transformation gave me that edge.&quot;
              </p>
              <p className="text-orange-500 font-semibold">— Software Architect</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <CheckoutButton 
              size="lg" 
              className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
            >
              CREATE YOUR OWN SUCCESS STORY
            </CheckoutButton>
          </div>
        </div>
      </section>

      {/* SPACER */}
      <div className="h-16"></div>

      {/* SECTION 6: AUTHORITY BUILDER BIO */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Bio Image */}
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/james_pose.jpg"
                  alt="James Klein - Competitive bodybuilder and successful IT professional"
                  fill
                  className="object-contain object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>

            {/* Right: Bio Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Built by Someone Who&apos;s Been There
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-orange-300">
                <p className="text-white font-semibold">
                  James Klein is a certified personal trainer, nutrition coach and expert advisor for publications like Fit & Well. He has helped dozens of clients lose weight, get stronger and lead healhier lives. The nickname &quot;KleinDawg&quot; was won on the high school Lacrosse field, where he was underestimated - until he let out his inner Dawg and claimed the respect he deserved.
                </p>
                <p>
                  A lifelong hockey player, he played ACHA Divison III hockey while pursuing his degree in Computer Information Systems. Like many athletes, he felt lost when his collegiate career ended - drowning himself in booze and food until he discovered powerlifting and bodybuilding.
                </p>
                <p className="text-white font-semibold">
                  The gym didn&apos;t just transform his body, helping him to lose more than 50 lbs and build a fit physique, but it helped him gain the confidence that led to a massive career success and personal wealth accumulation.
                </p>
                <p>
                  James is no stranger to adversity; DAWG Strength was his anchor through massive life events, like a near-deadly car accident, the mayhem of COVID, the gain and loss of millions of dollars and the premature loss of his mom.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-12 text-center">
          <CheckoutButton 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
              COMMIT NOW
          </CheckoutButton>
          </div>
        </div>
      </section>
    </main>
  )
}
