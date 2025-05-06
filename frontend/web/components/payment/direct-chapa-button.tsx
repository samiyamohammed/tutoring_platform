"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DirectChapaButtonProps {
  amount: number
  email: string
  firstName: string
  lastName: string
  title?: string
  currency?: string
  phone?: string
  onError?: (error: string) => void
}

export default function DirectChapaButton({
  amount,
  email,
  firstName,
  lastName,
  title = "Course Payment",
  currency = "ETB",
  phone = "",
  onError,
}: DirectChapaButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Generate a unique transaction reference
  const txRef = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Get the public key from environment variables
  const publicKey = process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY

  const handlePayment = () => {
    setIsLoading(true)

    try {
      // Store payment amount in localStorage for the success page
      localStorage.setItem("paymentAmount", amount.toString())
      localStorage.setItem("paymentTitle", title)

      // Create form data for submission
      const formData = new FormData()
      formData.append("public_key", publicKey || "")
      formData.append("tx_ref", txRef)
      formData.append("amount", amount.toString())
      formData.append("currency", currency)
      formData.append("email", email)
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("title", title)

      if (phone) {
        formData.append("phone_number", phone)
      }

      // Set return URL to the current domain's success page
      const returnUrl = `${window.location.origin}/student/payment/success`
      formData.append("return_url", returnUrl)

      // Create and submit the form
      const form = document.createElement("form")
      form.method = "POST"
      form.action = "https://api.chapa.co/v1/hosted/pay"

      // Append all form data as hidden inputs
      for (const [key, value] of formData.entries()) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      }

      // Add form to document and submit
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      setIsLoading(false)
      if (onError) {
        onError("Failed to initialize payment. Please try again.")
      }
      console.error("Payment initialization error:", error)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className="w-full" size="lg">
      {isLoading ? "Processing..." : "Pay with Chapa"}
      {!isLoading && <CreditCard className="ml-2 h-4 w-4" />}
    </Button>
  )
}
