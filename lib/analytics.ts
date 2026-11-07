// Conversion tracking helpers.
//
// Every event is sent two ways:
//   1. gtag('event', ...) so the Google tag (AW-...) sees it. Google Ads can
//      build conversion actions from these event names.
//   2. dataLayer.push({ event: ... }) so a Google Tag Manager container (if one
//      is installed via NEXT_PUBLIC_GTM_ID) can trigger tags off them.
//
// If a Google Ads conversion label is configured for an event, a direct
// 'conversion' hit is also sent to that conversion action.

export const GOOGLE_TAG_ID = "AW-18311040389"

type ConversionKey = "booking" | "checkout" | "purchase"

const CONVERSION_LABELS: Record<ConversionKey, string | undefined> = {
  booking: process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL,
  checkout: process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL,
  purchase: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
}

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function send(eventName: string, params: EventParams, conversion?: ConversionKey) {
  if (typeof window === "undefined") return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...params })

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params)

    const label = conversion ? CONVERSION_LABELS[conversion] : undefined
    if (label) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_TAG_ID}/${label}`,
        value: params.value,
        currency: params.currency,
        transaction_id: params.transaction_id,
      })
    }
  }
}

// Fires at most once per browser session for a given key, so reloads and
// re-renders don't double count.
function once(key: string): boolean {
  try {
    const storageKey = `tracked:${key}`
    if (sessionStorage.getItem(storageKey)) return false
    sessionStorage.setItem(storageKey, "1")
  } catch {
    // Storage unavailable: still send the event.
  }
  return true
}

const toMajorUnits = (amount: number) => Math.round(amount) / 100

/** Primary conversion: someone actually booked a Calendly call. */
export function trackConsultationBooked(eventType: string, inviteeUri?: string) {
  if (inviteeUri && !once(`booking:${inviteeUri}`)) return
  send("book_consultation", { event_type: eventType }, "booking")
}

/** Secondary conversion: reached checkout (cart-abandoner audience source). */
export function trackBeginCheckout(plan: string, amount: number, currency: string) {
  if (!once("begin_checkout")) return
  send(
    "begin_checkout",
    { plan, value: toMajorUnits(amount), currency: currency.toUpperCase() },
    "checkout",
  )
}

/** Plan switched on the checkout page. */
export function trackSelectPlan(plan: string, amount: number, currency: string) {
  send("select_plan", { plan, value: toMajorUnits(amount), currency: currency.toUpperCase() })
}

/** Completed purchase, with value and a transaction id for de-duplication. */
export function trackPurchase(transactionId: string, plan: string, amount: number, currency: string) {
  if (!once(`purchase:${transactionId}`)) return
  send(
    "purchase",
    {
      transaction_id: transactionId,
      plan,
      value: toMajorUnits(amount),
      currency: currency.toUpperCase(),
    },
    "purchase",
  )
}
