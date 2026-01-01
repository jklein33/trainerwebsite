import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function DawgStrengthProgram() {
  return (
    <main className="min-h-screen bg-black">
      {/* SECTION 1: RESULTS DRIVEN HEADLINE */}
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
            
            {/* Right: Hero Image - Creates connection and desire for results */}
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
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            Let's Go! 🔥
          </Button>
        </div>
      </section>

      {/* SECTION 3: EMOTION SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          {/* Emotion Driven Headline */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">
              Look great, feel great, and reach your goals in as little as 90 days.
            </h2>
          </div>

          {/* Image that creates connection and relatability */}
          <div className="mb-12">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              <Image
                src="/images/90-day-transformation.jpg"
                alt="Success collage showing transformation and achievements"
                fill
                className="object-contain object-center"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Transformational Story - Iconic Brand Story */}
          <div className="max-w-4xl mx-auto space-y-8 text-lg leading-relaxed">
          {/* <p className="text-xl text-gray-300">
              <span className="text-white font-semibold">After many years of failure, wasting time, trying to figure it all out on my own, yo-yoing up and down, trying fad diets. I finally figured out how to get results without wasting precious time I could be spending with my family or advancing my career. 
</span> 
         </p> */}
            
            <p className="text-2xl text-white font-medium leading-relaxed">
              <span className="text-orange-400 italic">Envision the Peace</span> – to  perform at a high level, without the anxiety that comes with trying to figure it all out on your own, not knowing if what you are doing will actually work.
            </p>

            <p className="text-xl text-gray-300 italic text-orange-400">
              It wasn&apos;t always this way, though.
            </p>

            <p className="text-xl text-gray-300">
              For years, I spent hours studying fitness and nutrition. Weeding through charlatans and morons who claimed to have the magic formula. After 7 years, I can confidently say, the Dawg Strength System WILL yield fat loss, but most importantly peace of mind and time back in your day to live life like a normal person. 
            </p>

            <p className="text-xl text-gray-300">
              <span className="text-white font-semibold">What changed?</span>
            </p>

            <p className="text-xl text-gray-300">
              He discovered powerlifting and bodybuilding. The gym didn&apos;t just transform his body—he lost 20+ pounds, built a fit physique, and gained the confidence that led to massive career success. <span className="text-white font-semibold">Decided that transformation was his foundation, and no matter what, he was gonna make it work. Just like we tell our clients – no excuses.</span>
            </p>

            <p className="text-2xl text-white font-bold text-center mt-12">
              And getting the results allowed him to become…
            </p>

            <p className="text-4xl text-orange-400 font-bold text-center">
              …Fully Booked. Fully Confident. Fully Successful.
            </p>
          </div>

          {/* Additional Image */}
          <div className="mt-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src="/images/hpe_intern.JPG"
                alt="James at Hewlett Packard Enterprise - building success in tech"
                fill
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Testimonials/Case Studies */}
          <div className="mt-16 grid gap-8 md:grid-cols-2">
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
        </div>
      </section>

      {/* SECTION 4: ACTION BUTTON - INSPIRES ACTION */}
      <section className="bg-black px-6 py-8 lg:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            Create Your Own Success Story
          </Button>
        </div>
      </section>

      {/* SECTION 5: SKEPTICAL BUYER SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          {/* Image that conveys what it's like to have results */}
          <div className="mb-12">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              <Image
                src="/images/2025_before_after.png"
                alt="Before and after transformation - from struggling to commanding respect"
                fill
                className="object-contain object-center"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: AUTHORITY BUILDER */}
      {/* COMMENTED OUT - Will be used elsewhere
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/james_pose.jpg"
                  alt="James Klein - Competitive bodybuilder and successful IT professional"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Built by Someone Who&apos;s Been There
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                <p>
                  James Klein is a competitive bodybuilder and former lead data engineering consultant who built his physique—and his wealth—while working in high-performance IT settings. He knows what it feels like to struggle with fitting fitness into a demanding tech career.
                </p>
                <p>
                  The discipline he built in the gym didn&apos;t just transform his body—it transformed his entire life. The same mental toughness that got him through grueling training sessions helped him navigate high-stakes consulting projects, negotiate better contracts, and build the confidence to take calculated risks.
                </p>
                <p className="text-xl text-white font-semibold italic">
                  This isn&apos;t just a fitness program—it&apos;s a blueprint for building the discipline, confidence, and respect that leads to success in every area of life.
                </p>
                <p className="text-gray-300">
                  He&apos;s created the Dawg Strength Program specifically for IT professionals who want to become the man they were born to be—physically, mentally, and financially.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* SECTION 7: FAQ SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center sm:text-5xl">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                How long will it take me to see results?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                The truth is, I don&apos;t know how long it&apos;s going to take <span className="text-white font-semibold italic">you</span> to get results—because that depends on you. I know this program is proven to work within 90 days when a committed professional shows up consistently, applies the principles, and doesn&apos;t quit when things get challenging. <span className="text-white font-semibold">Are you willing to do all those things?</span> Most clients feel the shift in confidence and energy within 4-6 weeks. The physical transformation—losing 20+ pounds and building a fit body that commands respect—becomes visible at 8-12 weeks. This is about getting real results that last, not quick fixes.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                How many modules are in the program?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                The real question you&apos;re asking is: <span className="text-white font-semibold">&quot;How long is it going to take me to get results?&quot;</span> The program is structured to fit your busy IT schedule and designed to be sustainable long-term. It&apos;s not a quick 30-day challenge—it&apos;s a complete system for losing 20+ pounds, building a fit body, and gaining the confidence that leads to career success. You&apos;ll have access to everything you need: training plans, nutritional guidance, recovery strategies, and the mindset work that separates successful men from everyone else.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Maybe I should try to get in shape on my own before I try this program?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Okay, what would you say to a potential client who says this to you about their career: &quot;Maybe I should try to get better at my job on my own before working with a mentor.&quot; If you don&apos;t want to get these types of objections from your clients, that starts with YOU. <span className="text-white font-semibold">Set the energetic standard that you want to receive.</span> The men who get the fastest results are the ones who commit fully, show up consistently, and invest in themselves without hesitation. Are you ready to commit, or are you going to keep making excuses?
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                I think I may just really suck and have no hope. Do you really think this program can help?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                This sounds more like impostor syndrome than actually being bad at what you do. In fact, I&apos;m sure you&apos;ve noticed men who aren&apos;t as capable as you being super successful. Ask yourself: <span className="text-white font-semibold">What results have I created for myself? What have I accomplished in my career?</span> If you can list any results, then you don&apos;t have a &quot;sucking&quot; problem—you have a confidence problem. Remember, all you have to do is be farther ahead than where you are now and be willing to commit. You don&apos;t need to be an IFBB pro or have decades of experience. You need proper positioning, the right system, and the willingness to get the results. <span className="text-white font-semibold">If they can do it, so can you.</span>
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Do I need a gym membership?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Yes, access to a gym is essential for optimal results. This program is about getting real results—losing 20+ pounds, building a fit body, gaining confidence—not shortcuts. However, we provide guidance on how to maximize your time in the gym, making every session count even with a busy IT schedule. The gym becomes your training ground for building the physique and confidence that translates to career success.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Is this program specifically for IT professionals?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Yes! The program is designed with the IT professional&apos;s schedule, lifestyle, and unique challenges in mind. We understand long hours, high stress, and the struggle to find time for fitness. The program is built to work with your reality, not against it. It&apos;s created by someone who&apos;s been exactly where you are—and built massive success from it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL VALUE-DRIVEN CTA */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Ready to Command Respect, Build Wealth, and Become the Man You Were Born to Be?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join the Dawg Strength Program and lose 20+ pounds, build a fit body, and gain the confidence that leads to massive career success. This isn&apos;t just about looking good—it&apos;s about becoming the man who gets what he wants, in the gym and in the boardroom.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            Commit to Your Success Story Now
          </Button>
        </div>
      </section>
    </main>
  )
}
