"use client"

import { useEffect } from "react"
import { trackPurchase } from "@/lib/analytics"

interface TrackPurchaseProps {
  transactionId: string
  plan: "monthly" | "annual"
  amount: number
  currency: string
}

/** Sends the purchase conversion once the success page has verified payment. */
export function TrackPurchase({ transactionId, plan, amount, currency }: TrackPurchaseProps) {
  useEffect(() => {
    trackPurchase(transactionId, plan, amount, currency)
  }, [transactionId, plan, amount, currency])

  return null
}
