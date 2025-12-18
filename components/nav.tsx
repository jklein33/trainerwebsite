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
    { href: "#client-stories", label: "Client Stories" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
    { href: "#packages", label: "Packages" },
  ]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-black px-6 py-4 lg:px-12">
      <Link href="/" className="flex items-center">
        <img
          src="/images/DawgStrengthLogo.png"
          alt="Dawg Strength logo"
          className="h-28 w-auto object-contain"
        />
      </Link>
      <div className="hidden items-center gap-6 md:flex lg:gap-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleClick(e, link.href)}
            className="text-base font-medium text-white transition-colors hover:text-orange-500 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
