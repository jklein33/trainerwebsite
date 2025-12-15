"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export function Nav() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#client-stories", label: "Client Stories" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-black px-6 py-4 lg:px-12">
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0">
          {/* Placeholder for German Shepherd logo - replace with actual image */}
          <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white leading-none">DAWG</span>
          <span className="text-xs font-medium text-white leading-tight">STRENGTH</span>
        </div>
      </Link>
      <div className="hidden items-center gap-6 md:flex lg:gap-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleClick(e, link.href)}
            className="text-sm font-medium text-white transition-colors hover:text-orange-500 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
