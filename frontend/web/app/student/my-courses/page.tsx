"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, CheckCircle, Clock, FileText, Filter, Search, Award, Bookmark, BarChart2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"


interface Enrollment {
  _id: string
  course: {
    _id: string
    title: string
    description: string
    image?: string
    tutor: {
      _id: string
      name: string
      avatar?: string
    }
    moduleCount?: number
    sectionCount?: number
  }
  currentStatus: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
  enrolledSessionType: 'online' | 'group' | 'oneOnOne'
  progress: {
    modules: Array<{
      moduleId: string
      status: 'not_started' | 'started' | 'completed'
      sections: Array<{
        sectionId: string
        status: 'not_started' | 'in_progress' | 'completed'
        timeSpent: number
        resourcesCompleted: Array<{
          resourceId: string
          resourceType: 'text' | 'video' | 'pdf' | 'quiz'
          completedAt: string
          completionData?: any
        }>
      }>
    }>
    completionPercentage: number
    timeSpentTotal: number
    currentModule?: {
      _id: string
      title: string
    }
    currentSection?: {
      _id: string
      title: string
    }
  }
  certification: {
    eligible: boolean
    issued: boolean
    certificateId?: string
  }
  payment: {
    status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
  }
  enrollmentDate: string
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        const response = await fetch('http://localhost:5000/api/enrollment/mycourses', {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Failed to fetch enrollments')

        const data = await response.json()
        setEnrollments(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch enrollments",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [toast])

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         enrollment.course.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || enrollment.currentStatus === statusFilter
    const matchesSessionType = sessionTypeFilter === "all" || enrollment.enrolledSessionType === sessionTypeFilter

    return matchesSearch && matchesStatus && matchesSessionType
  })

  const statusCounts = {
    all: enrollments.length,
    enrolled: enrollments.filter(e => e.currentStatus === 'enrolled').length,
    in_progress: enrollments.filter(e => e.currentStatus === 'in_progress').length,
    completed: enrollments.filter(e => e.currentStatus === 'completed').length,
  }

  const getCompletedModules = (enrollment: Enrollment) => {
    return enrollment.progress.modules.filter(m => m.status === 'completed').length
  }

  const getCompletedSections = (enrollment: Enrollment) => {
    return enrollment.progress.modules.reduce(
      (acc, module) => acc + module.sections.filter(s => s.status === 'completed').length, 0
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">My Courses</h1>
                <p className="text-sm text-muted-foreground">View all your enrolled courses</p>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-8 w-full mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">My Courses</h1>
              <p className="text-sm text-muted-foreground">View all your enrolled courses</p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your courses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="enrolled">Enrolled ({statusCounts.enrolled})</SelectItem>
                    <SelectItem value="in_progress">In Progress ({statusCounts.in_progress})</SelectItem>
                    <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Session Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="oneOnOne">One-on-One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {filteredEnrollments.length} {filteredEnrollments.length === 1 ? "Course" : "Courses"} Found
                </h2>
                <div className="flex items-center gap-2">
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1 capitalize">
                      {statusFilter.replace('_', ' ')}
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                  {sessionTypeFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1 capitalize">
                      {sessionTypeFilter.replace('_', ' ')}
                      <button
                        onClick={() => setSessionTypeFilter("all")}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                </div>
              </div>

              {filteredEnrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No courses found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    We couldn't find any courses matching your search criteria. Try adjusting your filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setStatusFilter("all")
                      setSessionTypeFilter("all")
                      setSearchQuery("")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEnrollments.map((enrollment) => (
                    <EnrollmentCard 
                      key={enrollment._id} 
                      enrollment={enrollment}
                      completedModules={getCompletedModules(enrollment)}
                      completedSections={getCompletedSections(enrollment)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function EnrollmentCard({ 
  enrollment,
  completedModules,
  completedSections
}: { 
  enrollment: Enrollment
  completedModules: number
  completedSections: number
}) {
  const statusColors = {
    enrolled: "bg-blue-100 text-blue-800",
    in_progress: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    dropped: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
  }

  const sessionTypeIcons = {
    online: <User className="h-4 w-4" />,
    group: <User className="h-4 w-4" />,
    oneOnOne: <User className="h-4 w-4" />,
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden relative">
        <img
          src={enrollment.course.image || "/placeholder.svg"}
          alt={enrollment.course.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <Badge className={`capitalize ${statusColors[enrollment.currentStatus]}`}>
              {enrollment.currentStatus.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {sessionTypeIcons[enrollment.enrolledSessionType]}
              {enrollment.enrolledSessionType.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow space-y-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={enrollment.course.tutor?.avatar} alt={enrollment.course.tutor?.name} />
            <AvatarFallback>
              {enrollment.course.tutor?.name?.charAt(0) || "T"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{enrollment.course.tutor?.name || "Tutor Name"}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(enrollment.progress.completionPercentage)}%</span>
          </div>
          <Progress value={enrollment.progress.completionPercentage} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedModules}/{enrollment.course.moduleCount || '?'} modules</span>
            <span>{completedSections}/{enrollment.course.sectionCount || '?'} sections</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(enrollment.progress.timeSpentTotal)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            <span>{formatDate(enrollment.enrollmentDate)}</span>
          </div>
        </div>

        {/* {enrollment.certification.eligible && (
          <div className="flex items-center gap-2 text-sm">
            <Award className={`h-4 w-4 ${
              enrollment.certification.issued ? "text-green-500" : "text-yellow-500"
            }`} />
            <span className={enrollment.certification.issued ? "text-green-600" : "text-yellow-600"}>
              {enrollment.certification.issued ? "Certificate earned" : "Eligible for certificate"}
            </span>
          </div>
        )} */}

        {enrollment.progress.currentModule && (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BarChart2 className="h-4 w-4" />
              <span className="line-clamp-1">
                Current: {enrollment.progress.currentModule.title}
                {enrollment.progress.currentSection && ` - ${enrollment.progress.currentSection.title}`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" asChild>
          <Link href={`/student/course/${enrollment.course._id}`}>
            {enrollment.currentStatus === 'completed' ? 'View Course' : 'Continue Learning'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function User({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}