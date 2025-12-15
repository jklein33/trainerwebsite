import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { Services } from "@/components/services"
import { ClientStories } from "@/components/client-stories"
import { ContactForm } from "@/components/contact-form"
import { QuoteSection } from "@/components/quote-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <AboutSection />
      <Services />
      <ClientStories />
      <ContactForm />
      <QuoteSection />
    </main>
  )
}
