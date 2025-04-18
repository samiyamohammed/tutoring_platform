"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ChapaPaymentButtonProps {
  amount: number
  email: string
  firstName?: string
  lastName?: string
  title?: string
  returnUrl?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function ChapaPaymentButton({
  amount,
  email,
  firstName,
  lastName,
  title = "Course Payment",
  returnUrl,
  onSuccess,
  onError,
}: ChapaPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Initialize payment
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          email,
          firstName,
          lastName,
          title,
          returnUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment")
      }

      // Open Chapa checkout
      if (data.data && data.data.checkout_url) {
        // Option 1: Redirect to Chapa checkout page
        window.location.href = data.data.checkout_url

        // Option 2: Use Chapa inline (requires the Chapa JS to be loaded)
        // if (window.Chapa) {
        //   window.Chapa.checkout({
        //     tx_ref: data.data.tx_ref,
        //     amount,
        //     currency: 'ETB',
        //     public_key: process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY,
        //     email,
        //     first_name: firstName,
        //     last_name: lastName,
        //     title,
        //     description: 'Payment for course enrollment',
        //     callback: (response: any) => {
        //       if (onSuccess) onSuccess(response);
        //     },
        //     onClose: () => {
        //       setIsLoading(false);
        //     }
        //   });
        // }

        if (onSuccess) onSuccess(data)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
      })
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay Now"
      )}
    </Button>
  )
}
