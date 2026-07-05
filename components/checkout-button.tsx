"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CheckoutButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
}

export function CheckoutButton({ children, className, size = "lg" }: CheckoutButtonProps) {
  return (
    <Link href="/checkout">
      <Button
        size={size}
        className={className}
      >
        {children}
      </Button>
    </Link>
  )
}

