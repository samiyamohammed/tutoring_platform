"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Types based on your schema
type User = {
  _id: string
  name: string
  email: string
  avatar?: string
}

type Course = {
  _id: string
  title: string
  description: string
}

type Module = {
  _id: string
  title: string
  description: string
}

type Section = {
  _id: string
  title: string
  description: string
}

type ModuleProgress = {
  moduleId: string
  title: string
  status: 'not_started' | 'started' | 'completed'
  startedAt?: string
  completedAt?: string
  timeSpent: number
  sections: SectionProgress[]
}

type SectionProgress = {
  sectionId: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  timeSpent: number
}

type AssessmentProgress = {
  assessmentId: string
  title: string
  assessmentType: 'quiz' | 'assignment' | 'exam'
  bestScore: number
  passed: boolean
  attempts: number
}

type Enrollment = {
  _id: string
  student: User
  course: Course
  enrolledSessionType: 'online' | 'group' | 'oneOnOne'
  currentStatus: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
  progress: {
    modules: ModuleProgress[]
    completionPercentage: number
    timeSpentTotal: number
    lastActivity: string
  }
  payment: {
    status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
    amountPaid: number
    totalAmount: number
    transactions: {
      amount: number
      date: string
      method: string
      status: string
    }[]
  }
  enrollmentDate: string
  startDate?: string
  expectedCompletionDate?: string
  actualCompletionDate?: string
  certification?: {
    eligible: boolean
    issued: boolean
    issuedAt?: string
  }
}

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("progress")

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch enrollment with all populated data
        const enrollmentRes = await fetch(
          `http://localhost:5000/api/enrollment/${params.id}?populate=student,course,progress.modules,progress.assessments`,
          { headers }
        )
        if (!enrollmentRes.ok) throw new Error('Failed to fetch enrollment data')
        const enrollmentData = await enrollmentRes.json()

        setEnrollment(enrollmentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollment()
  }, [params.id])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dropped':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'suspended':
        return <PauseCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return "bg-blue-100 text-blue-800"
      case 'in_progress':
        return "bg-yellow-100 text-yellow-800"
      case 'completed':
        return "bg-green-100 text-green-800"
      case 'dropped':
        return "bg-red-100 text-red-800"
      case 'suspended':
        return "bg-orange-100 text-orange-800"
      default:
        return ""
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800"
      case 'partial':
        return "bg-blue-100 text-blue-800"
      case 'paid':
        return "bg-green-100 text-green-800"
      case 'refunded':
        return "bg-purple-100 text-purple-800"
      case 'failed':
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="w-[400px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button variant="ghost" asChild>
          <Link href="/tutor/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Link>
        </Button>
      </div>

      <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-md" />
          </div>
        ) : enrollment ? (
          <>
            {/* Student Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-16 w-16">
                {enrollment.student.avatar ? (
                  <AvatarImage src={enrollment.student.avatar} />
                ) : null}
                <AvatarFallback>
                  {enrollment.student.name 
                    ? enrollment.student.name.split(' ').map(n => n[0]).join('')
                    : enrollment.student.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {enrollment.student.name || enrollment.student.email}
                </h1>
                {enrollment.student.name && (
                  <p className="text-muted-foreground">{enrollment.student.email}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(enrollment.currentStatus)}>
                    {getStatusIcon(enrollment.currentStatus)}
                    <span className="ml-1">
                      {enrollment.currentStatus.replace('_', ' ')}
                    </span>
                  </Badge>
                  <Badge variant="outline">
                    {enrollment.enrolledSessionType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Course Progress
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enrollment.progress.completionPercentage}%
                  </div>
                  <Progress 
                    value={enrollment.progress.completionPercentage} 
                    className="mt-2 h-2" 
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Time Spent
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(enrollment.progress.timeSpentTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last active: {formatDateTime(enrollment.progress.lastActivity)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Payment Status
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(enrollment.payment.amountPaid)}
                  </div>
                  <Badge className={`mt-2 ${getPaymentStatusColor(enrollment.payment.status)}`}>
                    {enrollment.payment.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Enrollment Date
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatDate(enrollment.enrollmentDate)}
                  </div>
                  {enrollment.actualCompletionDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Completed: {formatDate(enrollment.actualCompletionDate)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="progress">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="payment">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="mr-2 h-4 w-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </TabsTrigger>
              </TabsList>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course: {enrollment.course.title}</CardTitle>
                    <CardDescription>{enrollment.course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {enrollment.progress.modules.map((module) => (
                        <Accordion key={module.moduleId} type="single" collapsible>
                          <AccordionItem value={module.moduleId}>
                            <AccordionTrigger>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-md border p-2">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-medium">{module.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={module.status === 'completed' ? 'bg-green-100' : module.status === 'started' ? 'bg-blue-100' : ''}>
                                      {module.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {formatTime(module.timeSpent)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="ml-14 space-y-4">
                                {module.sections.map((section) => (
                                  <div key={section.sectionId} className="flex items-start gap-4 p-3 border rounded-md">
                                    <div className="flex items-center justify-center rounded-md border p-2 mt-1">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium">{section.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className={section.status === 'completed' ? 'bg-green-100' : section.status === 'in_progress' ? 'bg-blue-100' : ''}>
                                          {section.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {formatTime(section.timeSpent)}
                                        </span>
                                      </div>
                                      {section.startedAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Started: {formatDateTime(section.startedAt)}
                                        </p>
                                      )}
                                      {section.completedAt && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Completed: {formatDateTime(section.completedAt)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      Total amount: {formatCurrency(enrollment.payment.totalAmount)} • 
                      Paid: {formatCurrency(enrollment.payment.amountPaid)} • 
                      Balance: {formatCurrency(enrollment.payment.totalAmount - enrollment.payment.amountPaid)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollment.payment.transactions.length > 0 ? (
                          enrollment.payment.transactions.map((transaction, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>{transaction.method}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              No payment transactions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Notes</CardTitle>
                    <CardDescription>
                      Add private notes about this student's progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground">No notes yet</p>
                      <Button variant="outline" className="mt-4">
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Communication history with this student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground">No messages yet</p>
                      <Button variant="outline" className="mt-4">
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Student not found</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/tutor/students">
                Back to Students
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}