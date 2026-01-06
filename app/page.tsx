import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { Services } from "@/components/services"
import { ClientStories } from "@/components/client-stories"
import { ContactForm } from "@/components/contact-form"
import { QuoteSection } from "@/components/quote-section"
import { Packages } from "@/components/packages"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <AboutSection />
      <Services />
      <ClientStories />
      <Packages />
      <ContactForm />
      <QuoteSection />
    </main>
  )
}
