"use client"

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
