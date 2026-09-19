"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { courseHref } from "@/lib/courses/links";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];
const linkStyle =
  "rounded px-2 py-3 text-sm font-medium text-white transition-colors hover:text-orange-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 lg:text-base";

export function Nav() {
  const pathname = usePathname();
  if (
    /^\/(learn|admin|login|register|forgot-password|reset-password|preview)(\/|$)/.test(
      pathname,
    )
  )
    return null;
  // Reset the mobile menu after navigation, including browser Back/Forward.
  return <PublicNav key={pathname} pathname={pathname} />;
}

function PublicNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  function followSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (
      pathname !== "/" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    const element = document.querySelector(href.slice(1));
    if (element) {
      event.preventDefault();
      element.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
  }
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black px-4 py-3 sm:px-6 lg:px-12">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <Link
          href="/"
          aria-label="Dawg Strength home"
          className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-orange-400"
        >
          <Image
            src="/images/DawgStrengthLogo.png"
            alt="Dawg Strength"
            width={320}
            height={160}
            className="h-16 w-auto object-contain sm:h-20 lg:h-24"
          />
        </Link>
        <div className="hidden items-center gap-4 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => followSection(event, link.href)}
              className={linkStyle}
            >
              {link.label}
            </a>
          ))}
          <Link href={courseHref("/login")} className={linkStyle}>
            Member sign in
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={courseHref()}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 lg:px-6 lg:text-base"
          >
            Courses
          </Link>
          <button
            ref={toggle}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            onClick={() => setOpen(!open)}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-white/20 text-white focus-visible:outline-2 focus-visible:outline-orange-400 lg:hidden"
          >
            {open ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          id="public-mobile-menu"
          hidden={!open}
          className="w-full border-t border-white/10 pt-3 pb-2 lg:hidden"
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => followSection(event, link.href)}
                className={linkStyle}
              >
                {link.label}
              </a>
            ))}
            <Link
              href={courseHref("/login")}
              onClick={() => setOpen(false)}
              className={linkStyle}
            >
              Member sign in
            </Link>
            <Link
              href={courseHref("/register")}
              onClick={() => setOpen(false)}
              className={linkStyle}
            >
              Create an account
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
