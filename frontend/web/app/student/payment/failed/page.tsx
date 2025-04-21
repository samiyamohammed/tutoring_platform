"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useSearchParams } from "next/navigation"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("error") || "Your payment could not be processed."
  const courseId = searchParams.get("courseId") || "1"

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Payment Failed</h1>
              <p className="text-sm text-muted-foreground">There was an issue with your payment</p>
            </div>
          </div>

          <div className="flex-1 p-8 pt-6 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl">Payment Failed</CardTitle>
                <CardDescription>
                  We couldn't process your payment. Please try again or use a different payment method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">{errorMessage}</div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Possible reasons for payment failure:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Insufficient funds in your account</li>
                    <li>Card has expired or is invalid</li>
                    <li>Transaction was declined by your bank</li>
                    <li>Network or connectivity issues</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/student/checkout/${courseId}`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/student/explore">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/student/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
