"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
]

function scrollToHash(hash: string) {
  const element = document.querySelector(hash)
  if (!element) return false
  element.scrollIntoView({ behavior: "smooth", block: "start" })
  return true
}

export function Nav() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/") return
    const hash = window.location.hash
    if (!hash.startsWith("#")) return

    let attempts = 0
    let frame = 0
    const tryScroll = () => {
      if (scrollToHash(hash) || attempts >= 10) return
      attempts += 1
      frame = requestAnimationFrame(tryScroll)
    }
    frame = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/" && scrollToHash(hash)) {
      e.preventDefault()
      window.history.pushState(null, "", hash)
    }
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-black px-6 py-4 lg:px-12 lg:py-6">
      <Link href="/" className="flex items-center">
        <img
          src="/images/DawgStrengthLogo.png"
          alt="Dawg Strength logo"
          className="h-32 w-auto object-contain lg:h-40"
        />
      </Link>
      <div className="hidden items-center gap-6 md:flex lg:gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={`/${link.href}`}
            onClick={(e) => handleClick(e, link.href)}
            className="text-base font-medium text-white transition-colors hover:text-orange-500 cursor-pointer lg:text-lg"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
