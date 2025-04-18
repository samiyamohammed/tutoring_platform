"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState({
    txRef: "",
    amount: "0.00",
    title: "",
    date: new Date().toLocaleString(),
  })

  useEffect(() => {
    // Get transaction reference from URL
    const txRef = searchParams.get("tx_ref") || ""

    // In a real app, you would verify the payment with your backend
    // For now, we'll just display the transaction reference and data from localStorage
    setPaymentDetails({
      txRef,
      amount: localStorage.getItem("paymentAmount") || "0.00",
      title: localStorage.getItem("paymentTitle") || "Course Payment",
      date: new Date().toLocaleString(),
    })
  }, [searchParams])

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Payment Successful</h1>
              <p className="text-sm text-muted-foreground">Your payment has been processed successfully</p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                <CardDescription>
                  Your payment has been processed successfully and your enrollment is now complete.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Transaction Reference:</div>
                    <div className="font-medium text-right">{paymentDetails.txRef}</div>
                    <div className="text-muted-foreground">Course:</div>
                    <div className="font-medium text-right">{paymentDetails.title}</div>
                    <div className="text-muted-foreground">Amount Paid:</div>
                    <div className="font-medium text-right">${paymentDetails.amount}</div>
                    <div className="text-muted-foreground">Date:</div>
                    <div className="font-medium text-right">{paymentDetails.date}</div>
                    <div className="text-muted-foreground">Payment Method:</div>
                    <div className="font-medium text-right">Chapa</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button asChild className="w-full">
                  <Link href="/student/dashboard">
                    Go to My Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/student/dashboard">Back to Dashboard</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
