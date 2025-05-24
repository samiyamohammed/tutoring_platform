"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useToast } from "@/components/ui/use-toast"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentDetails, setPaymentDetails] = useState({
    txRef: "",
    amount: "0.00",
    title: "",
    date: "",
    courseId: "",
    sessionType: "",
    paymentOption: ""
  })
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  useEffect(() => {
    const txRef = searchParams.get("tx_ref") || ""
    const courseId = localStorage.getItem("lastPaidCourseId") || ""
    const sessionType = localStorage.getItem("paymentSessionType") || "online"
    const paymentOption = localStorage.getItem("paymentOption") || "full"

    setPaymentDetails({
      txRef,
      amount: localStorage.getItem("paymentAmount") || "0.00",
      title: localStorage.getItem("paymentTitle") || "Course Payment",
      date: new Date().toLocaleString(),
      courseId,
      sessionType,
      paymentOption
    })

    // Create enrollment if not already created
    createEnrollment(courseId, sessionType, paymentOption, txRef)

  }, [searchParams])

  const createEnrollment = async (courseId: string, sessionType: string, paymentOption: string, txRef: string) => {
    setEnrollmentStatus('processing')

    try {
      const token = localStorage.getItem("token") || ''
      const user = localStorage.getItem("user") || ''
      const studentId = JSON.parse(user).id
      const amount = parseFloat(localStorage.getItem("paymentAmount") || "0")

      // Prepare the enrollment data according to your schema
      const enrollmentData = {
        student: studentId,
        course: courseId,
        enrolledSessionType: sessionType,
        payment: {
          status: "paid",
          amountPaid: amount,
          totalAmount: paymentOption === "full" ? amount : amount * 3,
          paymentMethod: "Chapa",
          transactions: [{
            amount: amount,
            date: new Date().toISOString(),
            transactionId: txRef,
            method: "Chapa",
            status: "completed"
          }]
        },
        // Initialize empty progress tracking
        progress: {
          completionPercentage: 0,
          timeSpentTotal: 0
        }
      }

      console.log("Enrollment Data:", enrollmentData)
      const response = await fetch("http://localhost:5000/api/enrollment/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(enrollmentData)
      })

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to create enrollment")
      }

      // Clear payment details from localStorage
      localStorage.removeItem("paymentAmount")
      localStorage.removeItem("paymentTitle")
      localStorage.removeItem("paymentCourseId")
      localStorage.removeItem("paymentSessionType")
      localStorage.removeItem("paymentOption")
      localStorage.removeItem("lastPaidCourseId")

      setEnrollmentStatus('success')

    } catch (error) {
      console.error("Enrollment creation failed:", error)
      setEnrollmentStatus('error')
      toast({
        variant: "destructive",
        title: "Enrollment Error",
        description: error instanceof Error ? error.message : "Failed to complete enrollment"
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Payment Successful</h1>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed successfully
              </p>
            </div>
          </div>

          <div className="flex-1 p-8 pt-6 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">
                  {enrollmentStatus === 'error' ? 'Payment Complete' : 'Payment Successful!'}
                </CardTitle>
                <CardDescription>
                  {enrollmentStatus === 'processing' && "Processing your enrollment..."}
                  {enrollmentStatus === 'success' && "Your enrollment is now complete!"}
                  {enrollmentStatus === 'error' && "Payment completed but enrollment processing failed. Please contact support."}
                  {enrollmentStatus === 'idle' && "Verifying your payment..."}
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
                    <div className="text-muted-foreground">Session Type:</div>
                    <div className="font-medium text-right capitalize">{paymentDetails.sessionType}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2">
                {enrollmentStatus === 'success' && (
                  <Button asChild className="w-full">
                    <Link href={`/student/course/${paymentDetails.courseId}`}>
                      Go to Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {enrollmentStatus === 'error' && (
                  <Button asChild className="w-full">
                    <Link href="/student/support">
                      Contact Support
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/student/dashboard">
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