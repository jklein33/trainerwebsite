import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { Services } from "@/components/services"
import { ContactForm } from "@/components/contact-form"
import { QuoteSection } from "@/components/quote-section"
import { CourseEntry } from "@/components/course-entry"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <AboutSection />
      <Services />
      <CourseEntry />
      <ContactForm />
      <QuoteSection />
    </main>
  )
}
