"use client"

import { useEffect } from "react"
import { trackConsultationBooked } from "@/lib/analytics"

interface CalendlyEmbedProps {
  url: string
  className?: string
}

export function CalendlyEmbed({ url, className = "" }: CalendlyEmbedProps) {
  // Extract the Calendly username/event from the URL
  // Handles both full URLs and just the path
  const calendlyPath = url.includes('calendly.com/')
    ? url.split('calendly.com/')[1].split('?')[0]
    : url.replace(/^\//, '').split('?')[0]

  // The booking happens inside Calendly's iframe, so page-level tags can't see
  // it. Calendly posts a message to the parent window when a call is booked;
  // turn that into a real conversion event.
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return
      const data = e.data as { event?: string; payload?: { invitee?: { uri?: string } } }
      if (data?.event !== "calendly.event_scheduled") return
      trackConsultationBooked(calendlyPath, data.payload?.invitee?.uri)
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [calendlyPath])

  return (
    <div className={`calendly-inline-widget ${className}`} style={{ minWidth: '320px', height: '700px' }}>
      <iframe
        src={`https://calendly.com/${calendlyPath}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : ''}&embed_type=Inline`}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Schedule a call"
        className="rounded-lg"
      />
    </div>
  )
}
