"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertCircle,
  Loader2,
  MoreVertical
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TutorSidebar } from "@/components/tutor-sidebar"

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
}

type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'

type Enrollment = {
  _id: string
  student: User
  course: Course
  enrolledSessionType: 'online' | 'group' | 'oneOnOne'
  currentStatus: EnrollmentStatus
  progress: {
    completionPercentage: number
    timeSpentTotal: number
    lastActivity: string
  }
  payment: {
    status: PaymentStatus
    amountPaid: number
    totalAmount: number
  }
  enrollmentDate: string
  startDate?: string
  expectedCompletionDate?: string
  actualCompletionDate?: string
}

const statusIcons = {
  enrolled: <CheckCircle className="h-4 w-4 text-blue-500" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  dropped: <XCircle className="h-4 w-4 text-red-500" />,
  suspended: <PauseCircle className="h-4 w-4 text-orange-500" />
}

const statusColors = {
  enrolled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  dropped: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800"
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-purple-100 text-purple-800",
  failed: "bg-red-100 text-red-800"
}

export default function TutorStudentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "all">("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'enrollmentDate',
    direction: 'descending'
  })

  useEffect(() => {
    const fetchStudents = async () => {
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

       
        const tutorId = JSON.parse(localStorage.getItem('user') || '{}')._id
        // Fetch all enrollments with populated student and course data
        const enrollmentsRes = await fetch(
          `http://localhost:5000/api/enrollment`,
          { headers }
        )
        if (!enrollmentsRes.ok) throw new Error('Failed to fetch enrollments')
        const enrollmentsData = await enrollmentsRes.json()

        setEnrollments(enrollmentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const sortedEnrollments = [...enrollments].sort((a, b) => {
    if (sortConfig.key === 'student.name') {
      const nameA = a.student.name || a.student.email
      const nameB = b.student.name || b.student.email
      if (nameA < nameB) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (nameA > nameB) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    } else if (sortConfig.key === 'progress.completionPercentage') {
      return sortConfig.direction === 'ascending'
        ? a.progress.completionPercentage - b.progress.completionPercentage
        : b.progress.completionPercentage - a.progress.completionPercentage
    } else if (sortConfig.key === 'enrollmentDate') {
      const dateA = new Date(a.enrollmentDate).getTime()
      const dateB = new Date(b.enrollmentDate).getTime()
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA
    }
    return 0
  })

  const filteredEnrollments = sortedEnrollments.filter(enrollment => {
    const matchesSearch = 
      (enrollment.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = 
      statusFilter === "all" || enrollment.currentStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    <SidebarProvider>
          <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
            <TutorSidebar />
            <main className="flex flex-col">   
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading your students..." : `Manage ${filteredEnrollments.length} student enrollments`}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter === "all" ? "All Statuses" : statusFilter.replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("enrolled")}>
                  Enrolled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("dropped")}>
                  Dropped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "You don't have any students enrolled yet"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('student.name')}
                  >
                    <div className="flex items-center gap-1">
                      Student
                      {sortConfig.key === 'student.name' && (
                        sortConfig.direction === 'ascending' 
                          ? <ChevronUp className="h-4 w-4" /> 
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('progress.completionPercentage')}
                  >
                    <div className="flex items-center gap-1">
                      Progress
                      {sortConfig.key === 'progress.completionPercentage' && (
                        sortConfig.direction === 'ascending' 
                          ? <ChevronUp className="h-4 w-4" /> 
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('enrollmentDate')}
                  >
                    <div className="flex items-center gap-1">
                      Enrolled
                      {sortConfig.key === 'enrollmentDate' && (
                        sortConfig.direction === 'ascending' 
                          ? <ChevronUp className="h-4 w-4" /> 
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full border h-10 w-10 bg-muted/50">
                          {enrollment.student.avatar ? (
                            <img 
                              src={enrollment.student.avatar} 
                              alt={enrollment.student.name || enrollment.student.email}
                              className="rounded-full h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {enrollment.student.name 
                                ? enrollment.student.name.split(' ').map(n => n[0]).join('')
                                : enrollment.student.email[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {enrollment.student.name || enrollment.student.email}
                          </p>
                          {enrollment.student.name && (
                            <p className="text-sm text-muted-foreground">
                              {enrollment.student.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{enrollment.course.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {enrollment.enrolledSessionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={enrollment.progress.completionPercentage} 
                          className="h-2 w-24" 
                        />
                        <span className="text-sm font-medium">
                          {enrollment.progress.completionPercentage}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(enrollment.progress.timeSpentTotal)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className={statusColors[enrollment.currentStatus]}>
                              {statusIcons[enrollment.currentStatus]}
                              <span className="ml-1">
                                {enrollment.currentStatus.replace('_', ' ')}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Last activity: {formatDate(enrollment.progress.lastActivity)}</p>
                            {enrollment.actualCompletionDate && (
                              <p>Completed: {formatDate(enrollment.actualCompletionDate)}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[enrollment.payment.status]}>
                        {enrollment.payment.status}
                      </Badge>
                      <div className="text-xs mt-1">
                        {formatCurrency(enrollment.payment.amountPaid)} / {formatCurrency(enrollment.payment.totalAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(enrollment.enrollmentDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/tutor/students/${enrollment._id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/tutor/courses/${enrollment.course._id}?student=${enrollment.student._id}`}>
                              View Progress
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Send Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div> 
    </main>               
    </div>
    </SidebarProvider>
  )
}