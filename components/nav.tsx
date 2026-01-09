"use client"

import Image from "next/image"
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
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ]

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
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleClick(e, link.href)}
            className="text-base font-medium text-white transition-colors hover:text-orange-500 cursor-pointer lg:text-lg"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
