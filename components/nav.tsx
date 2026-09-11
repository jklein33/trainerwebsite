"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from 'next/image'

export function Nav() {
  const pathname = usePathname()
  if (/^\/(learn|admin|login|register|forgot-password|reset-password)(\/|$)/.test(pathname)) return null
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const navLinks = [
    { href: "/#services", label: "Services" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-black px-6 py-4 lg:px-12 lg:py-6">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/DawgStrengthLogo.png"
          alt="Dawg Strength logo"
          width={320}
          height={160}
          className="h-32 w-auto object-contain lg:h-40"
        />
      </Link>
      <div className="hidden items-center gap-6 md:flex lg:gap-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => { if (pathname === '/') handleClick(e, link.href.slice(1)) }}
            className="text-base font-medium text-white transition-colors hover:text-orange-500 cursor-pointer lg:text-lg"
          >
            {link.label}
          </a>
        ))}
        <Link href={process.env.NEXT_PUBLIC_COURSE_URL || '/learn'} className="text-orange-400">My courses</Link>
      </div>
    </nav>
  )
}
