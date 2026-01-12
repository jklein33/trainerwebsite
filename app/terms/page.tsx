export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12 lg:px-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-orange-500 mb-8">
            Terms and Services
          </h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using the Dawg Strength services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Services</h2>
              <p className="leading-relaxed">
                Dawg Strength provides personalized fitness training programs, nutrition guidance, and coaching services. All services are provided on a subscription or one-time payment basis as outlined during checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Payment Terms</h2>
              <p className="leading-relaxed">
                Payment is required in advance for all services. For subscription services, payments will be automatically charged on a recurring basis until cancelled. All sales are final unless otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Refund Policy</h2>
              <p className="leading-relaxed">
                Refunds are handled on a case-by-case basis. Please contact us directly to discuss any refund requests. Subscription cancellations will take effect at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Health and Safety</h2>
              <p className="leading-relaxed">
                You acknowledge that participation in fitness programs involves inherent risks. You should consult with a physician before beginning any exercise program. You agree to assume all risks associated with your participation in our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, including training programs, nutrition plans, and materials provided, are the exclusive property of Dawg Strength and are protected by copyright laws. You may not reproduce, distribute, or share these materials without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                Dawg Strength shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms and Services, please contact us through our website contact form.
              </p>
            </section>

            <section>
              <p className="text-sm text-gray-400 mt-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
