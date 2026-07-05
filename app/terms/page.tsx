import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12 lg:px-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-orange-500 mb-4">
            Dawg Strength Terms of Service
          </h1>
          <p className="text-gray-400 mb-8">
            Last Updated: January 13, 2026
          </p>
          
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8">
              <p className="text-white font-semibold mb-2">
                Welcome, and thank you for your interest in Dawg Strength ("Community Owner," "we," or "us") and our online community, along with any mobile or other downloadable applications that we make available to enable access to the same (collectively, the "Community"). These Terms of Service are a legally binding contract between you and Community Owner regarding your use of the Community.
              </p>
              <p className="text-orange-500 font-bold mt-4 mb-2">
                PLEASE READ THE FOLLOWING TERMS CAREFULLY.
              </p>
              <p className="text-sm">
                BY ACCEPTING THESE TERMS, EITHER BY CLICKING "I ACCEPT," OR BY OTHERWISE ACCESSING OR USING THE COMMUNITY, YOU AGREE THAT YOU HAVE READ AND UNDERSTOOD, AND, AS A CONDITION TO YOUR USE OF AND ACCESS TO THE COMMUNITY, YOU AGREE TO BE BOUND BY, THE FOLLOWING TERMS AND CONDITIONS, INCLUDING COMMUNITY OWNER'S PRIVACY POLICY (COLLECTIVELY, THESE "TERMS") AND THE ADDITIONAL TERMS ATTACHED AS EXHIBIT A (THE "ADDITIONAL TERMS") EITHER (A) ON BEHALF OF YOURSELF AS AN INDIVIDUAL, OR (B) IF YOU ARE ACCESSING THE COMMUNITY ON BEHALF OF AN ENTITY, ORGANIZATION, OR COMMUNITY OWNER, ON BEHALF OF SUCH ENTITY, ORGANIZATION OR COMMUNITY OWNER FOR WHICH YOU ACT, AND YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND SUCH ENTITY, ORGANIZATION OR COMMUNITY OWNER TO THIS AGREEMENT. IF YOU ARE NOT ELIGIBLE, OR DO NOT AGREE TO THE TERMS, THEN YOU DO NOT HAVE OUR PERMISSION TO USE THE COMMUNITY. YOUR USE OF THE COMMUNITY, AND COMMUNITY OWNER'S PROVISION OF THE COMMUNITY TO YOU, CONSTITUTES AN AGREEMENT BY COMMUNITY OWNER AND BY YOU TO BE BOUND BY THESE TERMS.
              </p>
              <p className="text-orange-500 font-bold mt-4">
                ARBITRATION NOTICE. Except for certain kinds of disputes described in Section 15 (Dispute Resolution and Arbitration), you agree that disputes arising under these Terms will be resolved by binding, individual arbitration, and BY ACCEPTING THESE TERMS, YOU AND COMMUNITY OWNER ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE IN ANY CLASS ACTION OR REPRESENTATIVE PROCEEDING.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Eligibility</h2>
              <p>
                You must be at least 18 years old to join the Community or have the consent of a parent or legal guardian. By agreeing to these Terms, you represent and warrant to us that: (a) you are at least 18 years old or you are at least 13 years old and have obtained verifiable consent from a parent or legal guardian to join the Community; (b) you have not previously been suspended or removed from the Community; and (c) your registration and your use of the Community is in compliance with any and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Accounts and Registration</h2>
              <p>
                To access most features of the Community, you must register for an account. When you register for an account, you may be required to provide us with some information about yourself, such as your name, email address, or other contact information. You agree that the information you provide to us is accurate, complete, and not misleading, and that you will keep it accurate and up to date at all times. When you register, you will be asked to create a password. You are solely responsible for maintaining the confidentiality of your account and password, and you accept responsibility for all activities that occur under your account. If you believe that your account is no longer secure, then you should immediately notify us at <a href="mailto:support@dawgstrength.com" className="text-orange-500 hover:text-orange-600 underline">support@dawgstrength.com</a> or by using the mechanisms made available by Community Owner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. LICENSES</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.1. Limited License</h3>
                  <p>
                    Subject to your complete and ongoing compliance with these Terms, Community Owner grants you, solely for your personal, non-commercial use, a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to: (a) install and use any mobile or other downloadable application provided to you by Community Owner and associated with the Community on a mobile device that you own or control; and (b) access and use the Community.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.2. License Restrictions</h3>
                  <p>
                    Except and solely to the extent such a restriction is impermissible under applicable law, you may not: (a) reproduce, distribute, publicly display, publicly perform, or create derivative works of the software powering the Community; (b) make modifications to the software powering the Community; or (c) interfere with or circumvent any feature of the Community, including any security or access control mechanism. If you are prohibited under applicable law from using the Community, then you may not use it.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">3.3. Feedback</h3>
                  <p>
                    If you provide input and suggestions regarding the Community ("Submissions"), you grant Community Owner an unrestricted, perpetual, irrevocable, non-exclusive, fully-paid, royalty-free right and license to exploit the Submissions in any manner and for any purpose.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Ownership; Proprietary Rights</h2>
              <p>
                The Community is owned and operated by Community Owner. All visual interfaces, graphics, design, compilation, information, data, computer code, products, software, services, and all other elements of the Community ("Materials") are protected by intellectual property laws. All Materials are the property of Community Owner or its third-party licensors. Except as expressly authorized, you may not make use of the Materials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. THIRD-PARTY TERMS</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">5.1. Third-Party Services</h3>
                  <p>
                    The Community may integrate with third-party platforms, including Discord (for community) and GoHighLevel (for online program delivery). Your use of Discord is subject to <Link href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Discord's Terms of Service</Link> and <Link href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Community Guidelines</Link>. Your use of GoHighLevel is subject to <Link href="https://www.gohighlevel.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">GoHighLevel's Terms of Service</Link>. Community Owner is not responsible for third-party services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">5.2. Third-Party Software</h3>
                  <p>
                    The Community may include third-party software components licensed under open-source terms.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. USER CONDUCT</h2>
              <p className="text-gray-400 italic">
                Standard user conduct provisions apply, including user content licenses, representations, disclaimers, monitoring, and prohibitions on child sexual abuse/exploitation material.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. COMMUNICATIONS</h2>
              <p className="text-gray-400 italic">
                Standard communication provisions apply, including push notifications, in-app notifications, and email communications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. PROHIBITED CONDUCT</h2>
              <p className="text-gray-400 italic">
                Standard prohibited conduct provisions apply, including restrictions on illegal activities, harassment, spam, and other prohibited behaviors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. INTELLECTUAL PROPERTY RIGHTS PROTECTION</h2>
              <p className="text-gray-400 italic">
                Standard intellectual property protection provisions apply, including respect for third-party rights and DMCA compliance procedures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modification of Terms</h2>
              <p className="text-gray-400 italic">
                Community Owner reserves the right to modify these Terms at any time. Material changes will be communicated to users, and continued use of the Community after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. TERM, TERMINATION, AND MODIFICATION OF THE COMMUNITY</h2>
              <p className="text-gray-400 italic">
                Standard provisions regarding the term of these Terms, termination rights, effects of termination, and Community Owner's right to modify or discontinue the Community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Indemnity</h2>
              <p className="text-gray-400 italic">
                You agree to indemnify, defend, and hold harmless Community Owner from and against any claims, damages, losses, liabilities, and expenses arising from your use of the Community or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. DISCLAIMERS; NO WARRANTIES BY COMMUNITY OWNER</h2>
              <p className="text-gray-400 italic">
                The Community is provided "AS IS" without warranties of any kind. Standard disclaimers apply regarding merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. LIMITATION OF LIABILITY</h2>
              <p className="text-gray-400 italic">
                Standard limitation of liability provisions apply, limiting Community Owner's liability to the maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. DISPUTE RESOLUTION AND ARBITRATION</h2>
              <p className="text-gray-400 italic">
                Standard JAMS arbitration provisions apply. Disputes will be resolved through binding, individual arbitration, with exceptions for certain types of disputes. Class action waivers apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. MISCELLANEOUS</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">16.1. Third-Party Beneficiary</h3>
                  <p>
                    No specific third-party beneficiary is designated beyond the platforms referenced in Section 5.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">16.2. General Terms</h3>
                  <p className="text-gray-400 italic">
                    Standard general terms apply, including assignment, severability, and waiver provisions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">16.3. Governing Law</h3>
                  <p>
                    These Terms are governed by the laws of the State of Maryland without regard to conflict of law principles. You and Community Owner submit to the personal and exclusive jurisdiction of the state and federal courts located in Baltimore County, Maryland.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">16.4. Privacy Policy</h3>
                  <p>
                    The Privacy Policy is incorporated by reference into these Terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">16.5-16.7</h3>
                  <p className="text-gray-400 italic">
                    Standard provisions regarding precedence, electronic communications consent, and California notice requirements.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">17. Notice Regarding Apple</h2>
              <p className="text-gray-400 italic">
                If applicable to mobile app distribution, standard Apple App Store terms and acknowledgments apply.
              </p>
            </section>

            <div className="border-t border-gray-800 pt-8 mt-12">
              <h2 className="text-3xl font-bold text-orange-500 mb-6">Exhibit A: Additional Terms</h2>
              <h3 className="text-2xl font-bold text-white mb-4">Terms of Service – Dawg Strength Services</h3>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">1. OVERVIEW</h3>
                <p>
                  This Client Contract ("Agreement") is entered into between you (the "Client") and Dawg Strength LLC ("Company") for use of free and paid services provided by Dawg Strength LLC, including personal training, stretch therapy, and the online program.
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">2. TERM</h3>
                <p>
                  This Agreement becomes effective when the Client agrees to these terms and registers for services and remains in effect indefinitely unless terminated earlier.
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">3. SCOPE OF SERVICES FOR PERSONAL TRAINING & STRETCH THERAPY</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>1:1 Sessions:</strong> One-on-one personal training or stretch therapy sessions, in-person or virtually, customized to the Client's needs.</li>
                  <li><strong>Additional Support:</strong> Email support with responses within 72 hours (except holidays/vacations/illness).</li>
                  <li><strong>Overall Purpose:</strong> Educational services to improve personal fitness, health, mobility, and habits.</li>
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">4. CLIENT AND COMPANY DUTIES AND RESPONSIBILITIES FOR PERSONAL TRAINING & STRETCH THERAPY</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>24-Hour Cancellation Policy:</strong> Clients must provide at least 24 hours notice for cancellations or rescheduling. Late cancellations may result in forfeiture of the session.</li>
                  <li><strong>Communication, Behavior, No Tolerance Policy:</strong> Professional communication is required at all times. Harassment, abuse, or inappropriate behavior will result in immediate termination of services without refund.</li>
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">5. SCOPE OF SERVICES FOR THE ONLINE PROGRAM</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Asynchronous course material:</strong> Video lessons, resources, and community support primarily hosted on Discord, with course delivery potentially via GoHighLevel.</li>
                  <li><strong>Live group support calls</strong> as scheduled.</li>
                  <li><strong>Group community/forum</strong> on Discord.</li>
                  <li><strong>Additional Support:</strong> Questions in community forum; customer service via email.</li>
                  <li><strong>Overall Purpose:</strong> Educational program for fitness, health, stretch therapy, and habit change.</li>
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">6. CLIENT AND COMPANY DUTIES & RESPONSIBILITIES FOR THE ONLINE PROGRAM</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Cancellation/Rescheduling for live calls:</strong> Clients should provide reasonable notice for cancellations or rescheduling of live calls.</li>
                  <li><strong>Communication, Behavior:</strong> Professional communication is required. Inappropriate behavior may result in removal from the program without refund.</li>
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">7. PAYMENT POLICY</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Fees:</strong> Charged via designated payment processor (e.g., Stripe) as outlined at purchase.</li>
                  <li><strong>Payment Plans:</strong> Client responsible for all payments; late fees and suspension for failed payments.</li>
                  <li><strong>Chargebacks:</strong> Prohibited without consent; Company may report delinquent accounts.</li>
                </ul>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">8. REFUND POLICY</h3>
                <p className="text-orange-500 font-semibold">
                  No refunds will be given for any sessions, programs, or services under any circumstances due to preparation, scheduling, and knowledge-based nature.
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">9. DISCLAIMER</h3>
                <p>
                  No professional-client relationship is formed. Services are educational only. Client must consult medical professionals before starting. Inherent risks of injury exist (musculoskeletal, falls, etc.). Company is not a licensed medical provider, therapist, or dietitian. Results are not guaranteed. Statements are not medical advice.
                </p>
              </section>

              <section className="mt-6">
                <p className="text-gray-400 italic">
                  The remaining sections of Exhibit A (Guarantees and Warranties, Limitation of Liability, Waiver, Independent Contractor, Intellectual Property, Confidentiality, Prohibited Use, Indemnification, Severability, Waiver, Non-Disparagement, Governing Law (Maryland), Attorney's Fees, Assignment, Force Majeure, Termination, and Miscellaneous) follow standard terms and conditions applicable to personal training, stretch therapy, and online program services.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                <strong className="text-white">Note:</strong> This document is provided as a template. Consult a licensed attorney in Maryland to review, customize further, and ensure full compliance with applicable laws before use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
