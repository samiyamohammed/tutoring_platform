"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DirectChapaButton from "@/components/payment/direct-chapa-button"

interface Tutor {
  name: string
  avatar?: string
  rating: number
}

interface Pricing {
  online?: {
    price: number
    maxStudents: number
    schedule: Array<{
      day: string
      startTime: string
      endTime: string
    }>
  }
  group?: {
    price: number
    maxStudents: number
    schedule: Array<{
      day: string
      startTime: string
      endTime: string
    }>
  }
  oneOnOne?: {
    price: number
    maxStudents: number
    schedule: Array<{
      day: string
      startTime: string
      endTime: string
    }>
  }
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  tutor: Tutor
  currentEnrollment: number
  capacity: number
  rating: number
  reviews: number
  image?: string
  sessionTypes: string[]
  pricing: Pricing
  prerequisites: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.courseId as string

  const [course, setCourse] = (useState<Course | null>(null))
  const [loading, setLoading] = useState(true)
  const [paymentOption, setPaymentOption] = useState("full")
  const [sessionType, setSessionType] = useState("online")
  const [paymentError, setPaymentError] = useState("")

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        const response = await fetch(`http://localhost:5000/api/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Failed to fetch course details')

        const data = await response.json()
        setCourse(data)
        // Set default session type to first available option
        if (data.sessionTypes.length > 0) {
          setSessionType(data.sessionTypes[0])
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch course details",
        })
        router.push("/student/explore")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, router, toast])

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/student/explore">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Checkout</h1>
                  <p className="text-sm text-muted-foreground">Complete your enrollment</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  if (!course) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/student/explore">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Checkout</h1>
                  <p className="text-sm text-muted-foreground">Complete your enrollment</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Course Not Found</AlertTitle>
                <AlertDescription>
                  The course you're trying to enroll in could not be found. Please return to the courses page and try again.
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Calculate prices based on selected options
  const basePrice = course.pricing[sessionType as keyof typeof course.pricing]?.price || 0
  const installmentPrice = Math.round((basePrice / 3) * 100) / 100
  const totalPrice = paymentOption === "full" ? basePrice : installmentPrice

  // Check if selected session type is available
  const isSessionTypeAvailable = (type: string) => {
    return course.sessionTypes.includes(type) && course.pricing[type as keyof typeof course.pricing]?.price
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/student/explore">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Checkout</h1>
                <p className="text-sm text-muted-foreground">Complete your enrollment</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 pt-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>Review the course you're enrolling in</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{course.tutor.name}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{course.level}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Options</CardTitle>
                    <CardDescription>Choose how you want to pay</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Session Type</h3>
                      <Tabs 
                        defaultValue={course.sessionTypes[0]} 
                        value={sessionType} 
                        onValueChange={setSessionType}
                      >
                        <TabsList className="grid w-full" style={{ 
                          gridTemplateColumns: `repeat(${course.sessionTypes.length}, minmax(0, 1fr))` 
                        }}>
                          {isSessionTypeAvailable('online') && (
                            <TabsTrigger value="online">
                              Online Course
                              <span className="ml-1 text-xs">${course.pricing.online?.price}</span>
                            </TabsTrigger>
                          )}
                          {isSessionTypeAvailable('group') && (
                            <TabsTrigger value="group">
                              Group Sessions
                              <span className="ml-1 text-xs">${course.pricing.group?.price}</span>
                            </TabsTrigger>
                          )}
                          {isSessionTypeAvailable('oneOnOne') && (
                            <TabsTrigger value="oneOnOne">
                              1-on-1 Sessions
                              <span className="ml-1 text-xs">${course.pricing.oneOnOne?.price}</span>
                            </TabsTrigger>
                          )}
                        </TabsList>
                      </Tabs>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Payment Plan</h3>
                      <RadioGroup defaultValue="full" value={paymentOption} onValueChange={setPaymentOption}>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="full" id="full" />
                          <Label htmlFor="full" className="flex-1 cursor-pointer">
                            <div className="font-medium">Full Payment</div>
                            <div className="text-sm text-muted-foreground">Pay the entire amount now</div>
                          </Label>
                          <div className="font-medium">${basePrice}</div>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="installment" id="installment" />
                          <Label htmlFor="installment" className="flex-1 cursor-pointer">
                            <div className="font-medium">Installment Plan</div>
                            <div className="text-sm text-muted-foreground">Pay in 3 monthly installments</div>
                          </Label>
                          <div className="font-medium">${installmentPrice}/mo</div>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentOption === "installment" && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Installment Plan Details</AlertTitle>
                        <AlertDescription>
                          You'll be charged ${installmentPrice} today, and the same amount on the same day for the next
                          2 months.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course Price</span>
                      <span>${basePrice}</span>
                    </div>
                    {paymentOption === "installment" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installment (1/3)</span>
                        <span>${installmentPrice}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Due Today</span>
                      <span>${totalPrice}</span>
                    </div>

                    {paymentError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <DirectChapaButton
                      amount={totalPrice}
                      email="student@example.com" // Replace with actual user email
                      firstName="Student" // Replace with actual user first name
                      lastName="User" // Replace with actual user last name
                      title={`${course.title} - ${sessionType} ${paymentOption === "installment" ? "(Installment 1/3)" : ""}`}
                      currency="ETB"
                      onError={(error) => setPaymentError(error)}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      By proceeding, you agree to our Terms of Service and Privacy Policy.
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}