"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-black px-6 py-24 lg:px-12">
      <div className="absolute inset-0">
        <Image
          src="/images/ambitious-studio-rick-barrett-1RNQ11ZODJM-unsplash.jpg"
          alt="Gym interior with dumbbells and equipment background"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative container mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-orange-500 sm:text-sm">
            CONTACT
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Ready to get to work?
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-gray-800/90 p-8 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-gray-700 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@framer.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-gray-700 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-white">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="I want to build muscles..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="border-gray-700 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500 resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 text-white hover:bg-orange-600 text-base font-bold px-8 py-6 rounded-lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </section>
  )
}

