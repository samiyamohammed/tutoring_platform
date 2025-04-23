"use client"

import type React from "react"

import { useEffect } from "react"

interface ChapaProviderProps {
  children: React.ReactNode
}

export function ChapaProvider({ children }: ChapaProviderProps) {
  useEffect(() => {
    // Load Chapa inline script
    const script = document.createElement("script")
    script.src = "https://checkout.chapa.co/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Clean up
      document.body.removeChild(script)
    }
  }, [])

  return <>{children}</>
}
