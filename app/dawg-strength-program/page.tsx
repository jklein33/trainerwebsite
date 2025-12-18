import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

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
                {/* PLACEHOLDER: Results Driven Headline */}
                Transform Your Body, Transform Your Life
              </h1>
              <p className="text-xl leading-relaxed text-gray-300 sm:text-2xl">
                {/* PLACEHOLDER: Unicorn message statement - results you sell and perpendicular positioning */}
                The only program designed specifically for IT professionals who want to build discipline, confidence, and the physique that matches their success.
              </p>
            </div>
            
            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src="/images/athena_dawg.jpeg"
                  alt="James with Athena the German Shepherd puppy"
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

      {/* SECTION 2: ACTION TAKER BUTTON */}
      <section className="bg-black px-6 py-8 lg:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            {/* PLACEHOLDER: Results driver CTA */}
            Start Your Transformation Today
          </Button>
        </div>
      </section>

      {/* SECTION 3: EMOTION SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          {/* Emotion Driven Headline */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">
              {/* PLACEHOLDER: Emotion driven headline */}
              From Fat Guy to Millionaire: The Power of Discipline
            </h2>
          </div>

          {/* Image that creates connection and relatability */}
          <div className="mb-12">
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              {/* PLACEHOLDER: Relatable image */}
              <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-gray-500">Emotional Connection Image Placeholder</span>
              </div>
            </div>
          </div>

          {/* Transformational Story */}
          <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-gray-300">
            <p className="text-xl text-white font-medium">
              {/* PLACEHOLDER: Transformational story - iconic brand story */}
              James started as a fat guy who wanted to get in shape. After years of playing hockey and lacrosse, he struggled to stay fit while working as a lead data engineering consultant in a high-performance setting.
            </p>
            <p>
              That&apos;s when he discovered powerlifting and bodybuilding. The gym didn&apos;t just transform his body—it built the discipline and confidence that led him to become a millionaire at 28 years old.
            </p>
            <p className="italic text-orange-400">
              The same discipline that built his physique built his career. The same confidence that came from lifting heavy weights gave him the courage to take calculated risks in business.
            </p>
            <p>
              Now, he&apos;s created the Dawg Strength Program specifically for IT professionals who want to become the man they were born to be—physically, mentally, and financially.
            </p>
          </div>

          {/* Additional Image */}
          <div className="mt-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              {/* PLACEHOLDER: Additional transformational image */}
              <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-gray-500">Additional Image Placeholder</span>
              </div>
            </div>
          </div>

          {/* Testimonials/Case Studies */}
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* PLACEHOLDER: Testimonial 1 */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <p className="text-white italic mb-4">
                &quot;This program changed everything for me. The discipline I built in the gym translated directly to my work.&quot;
              </p>
              <p className="text-orange-500 font-semibold">— IT Professional</p>
            </div>
            
            {/* PLACEHOLDER: Testimonial 2 */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <p className="text-white italic mb-4">
                &quot;I finally have the confidence to lead meetings and take on bigger projects. The gym gave me that.&quot;
              </p>
              <p className="text-orange-500 font-semibold">— Software Engineer</p>
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
            {/* PLACEHOLDER: CTA that inspires action */}
            Join the Transformation
          </Button>
        </div>
      </section>

      {/* SECTION 5: SKEPTICAL BUYER SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          {/* Image that conveys what it's like to have results */}
          <div className="mb-12">
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              {/* PLACEHOLDER: Image showing results */}
              <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-gray-500">Results Image Placeholder</span>
              </div>
            </div>
          </div>

          {/* Identify Build Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Are You the Kind of Person Who...
            </h2>
            <div className="space-y-4">
              {/* PLACEHOLDER: Identify build questions */}
              <div className="flex items-start gap-4 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <Check className="h-6 w-6 flex-shrink-0 text-orange-500 mt-1" />
                <p className="text-lg text-gray-300">
                  Wants to build discipline that translates to career success?
                </p>
              </div>
              <div className="flex items-start gap-4 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <Check className="h-6 w-6 flex-shrink-0 text-orange-500 mt-1" />
                <p className="text-lg text-gray-300">
                  Struggles to fit fitness into a busy IT schedule?
                </p>
              </div>
              <div className="flex items-start gap-4 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <Check className="h-6 w-6 flex-shrink-0 text-orange-500 mt-1" />
                <p className="text-lg text-gray-300">
                  Wants the confidence that comes from physical transformation?
                </p>
              </div>
              <div className="flex items-start gap-4 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <Check className="h-6 w-6 flex-shrink-0 text-orange-500 mt-1" />
                <p className="text-lg text-gray-300">
                  Is ready to become the man you were born to be?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: AUTHORITY BUILDER */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Bio Image */}
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                {/* PLACEHOLDER: Authority/bio image */}
                <div className="h-full w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-gray-500">Authority Image Placeholder</span>
                </div>
              </div>
            </div>

            {/* Right: Bio Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Built by Someone Who&apos;s Been There
              </h2>
              <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                <p>
                  {/* PLACEHOLDER: Authority bio */}
                  James Klein is a former lead data engineering consultant who built his physique while working in a high-performance IT setting. He understands the unique challenges of fitting fitness into a demanding tech career.
                </p>
                <p>
                  The discipline and confidence he built in the gym directly contributed to becoming a millionaire at 28 years old. Now, he&apos;s created the Dawg Strength Program to help other IT professionals unlock their full potential.
                </p>
                <p className="text-white font-semibold">
                  This isn&apos;t just a fitness program—it&apos;s a blueprint for building the discipline and confidence that leads to success in every area of life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ SECTION */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center sm:text-5xl">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {/* PLACEHOLDER: FAQ Items */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                How long will it take me to see results?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {/* PLACEHOLDER: Answer that addresses the question behind the question */}
                Most clients see noticeable changes in energy and confidence within 4-6 weeks. Physical transformation becomes visible at 8-12 weeks with consistent effort. Remember, this is about building discipline that lasts a lifetime, not quick fixes.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                How many modules are in the program?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {/* PLACEHOLDER: Answer that increases value */}
                The program is structured to fit your busy IT schedule. It&apos;s designed to be sustainable long-term, not a quick 30-day challenge. You&apos;ll have access to training plans, nutritional guidance, and ongoing support.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Do I need a gym membership?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {/* PLACEHOLDER: Answer */}
                Yes, access to a gym is recommended for optimal results. However, we provide guidance on how to maximize your time in the gym, making every session count even with a busy schedule.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Is this program specifically for IT professionals?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {/* PLACEHOLDER: Answer */}
                Yes! The program is designed with the IT professional&apos;s schedule and lifestyle in mind. We understand the challenges of long hours, stress, and finding time for fitness. The program is built to work with your reality, not against it.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                What if I&apos;m a complete beginner?
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {/* PLACEHOLDER: Answer */}
                Perfect! The program is designed to meet you where you are. Whether you&apos;re starting from zero or have some gym experience, the program adapts to your level and progresses as you build strength and confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL VALUE-DRIVEN CTA */}
      <section className="bg-black px-6 py-16 lg:px-12 lg:py-24">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {/* PLACEHOLDER: Value-driven headline */}
            Ready to Become the Man You Were Born to Be?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {/* PLACEHOLDER: Value proposition */}
            Join the Dawg Strength Program and build the discipline, confidence, and physique that matches your success.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 text-lg sm:text-xl px-12 py-8 rounded-xl font-bold shadow-lg"
          >
            {/* PLACEHOLDER: Final value-driven CTA */}
            Start Your Transformation Now
          </Button>
        </div>
      </section>
    </main>
  )
}
