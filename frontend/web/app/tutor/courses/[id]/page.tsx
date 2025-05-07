"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Settings,
  Star,
  Users,
  Video,
  BookOpen,
  Trash2,
  ListChecks,
  FileQuestion,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ContentType = 'video' | 'text'

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  deadline: Date
  tutor: string
  modules: Module[]
  quizzes: Quiz[]
  sessionTypes: ('online' | 'group' | 'oneOnOne')[]
  pricing: {
    online?: {
      price: number
      maxStudents: number
      schedule: {
        day: string
        startTime: string
        endTime: string
      }[]
    }
    group?: {
      price: number
      maxStudents: number
      schedule: {
        day: string
        startTime: string
        endTime: string
      }[]
    }
    oneOnOne?: {
      price: number
      maxStudents: number
      schedule: {
        day: string
        startTime: string
        endTime: string
      }[]
    }
  }
  prerequisites: string[]
  status: 'pending' | 'approved' | 'rejected'
  capacity: number
  waitingListCapacity: number
  currentEnrollment: number
  waitingList: string[]
  createdAt: Date
  updatedAt: Date
  // Analytics fields
  completionRate?: number
  averageScore?: number
  studentEngagement?: number
}

interface Session {
  _id: string
  courseId: string
  type: 'online' | 'group' | 'oneOnOne'
  title: string
  date: Date
  duration: number
  attendees: number
  maxAttendees: number
  student?: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
}

interface Student {
  _id: string
  name: string
  email: string
  avatar?: string
  progress: number
  enrollmentType: 'online' | 'group' | 'oneOnOne'
  lastActive: Date
}

interface Module {
  _id: string
  course: string
  title: string
  description: string
  content: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  duration: number
  isPublished: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

interface Quiz {
  _id: string
  title: string
  order: number
  duration: number
  gradingDate: Date  
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [content, setContent] = useState<(Module | Quiz)[]>([])  
  const [sessions, setSessions] = useState<Session[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 


    useEffect(() => {
          const fetchContent = async () => {
              try {
                  const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
  
                  console.log('Fetching content for course:', courseId)
                  console.log('Token:', token)
  
                  const [courseRes] = await Promise.all([
                      fetch(`${apiUrl}/api/course/${courseId}`, {
                          headers: { 'Authorization': `Bearer ${token}` },
                      })
                  ]);
  
                  if (!courseRes.ok) throw new Error('Failed to fetch content')
  
                  const courseData = await courseRes.json()
                  setCourse(courseData)
  
                  const modules = await courseData.modules
                  const quizzes = await courseData.quizzes
  
                  const combined = [...modules, ...quizzes].sort((a, b) => a.order - b.order)
                  setContent(combined)
              } catch (error) {
                  toast({
                      variant: "destructive",
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to fetch content",
                  })
              } finally {
                  setLoading(false)
              }
          }
  
          fetchContent()
      }, [courseId, toast])

  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!course) return

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
      const response = await fetch(`${apiUrl}/api/course/${course._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update course status')
      }

      setCourse({ ...course, status: newStatus })
      toast({
        title: "Success",
        description: `Course status updated to ${newStatus}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course status",
      })
    }
  }

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !course) return

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
      const response = await fetch(`${apiUrl}/api/course/${course._id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newModuleTitle,
          content: "", // Default empty content
          course: course._id,
          order: modules.length + 1 // Next order number
        }),
      })

      if (!response.ok) throw new Error('Failed to add module')

      const newModule = await response.json()
      setModules([...modules, newModule].sort((a, b) => a.order - b.order))
      setNewModuleTitle("")
      setIsAddingModule(false)
      toast({
        title: "Success",
        description: "Module added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add module",
      })
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Link href="/tutor/courses" className="text-sm text-muted-foreground hover:text-foreground">
                  Courses
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Loading...</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
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
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Link href="/tutor/courses" className="text-sm text-muted-foreground hover:text-foreground">
                  Courses
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Course Not Found</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium">Course not found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The course you're looking for doesn't exist or you don't have access to it
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/tutor/courses">
                    Back to Courses
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Calculate completion rate if not provided
  // const completionRate = course.completionRate ||
  //   (course.modules.length > 0
  //     ? Math.round(
  //       (course.modules.reduce((sum, module) => sum + (module.length[0]?.completedCount || 0), 0) /
  //         (course.currentEnrollment * course.modules.length)) * 100
  //     )
  //     : 0)

  // Filter upcoming sessions (within next 30 days)
  const upcomingSessions = sessions
    .filter(session => new Date(session.date) > new Date() &&
      new Date(session.date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Filter past sessions
  const pastSessions = sessions
    .filter(session => new Date(session.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Link href="/tutor/courses" className="text-sm text-muted-foreground hover:text-foreground">
                Courses
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tutor/courses/${course._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Play className="mr-2 h-4 w-4" />
                    Preview Course
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Course Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {course.status === "approved" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                      <Clock className="mr-2 h-4 w-4" />
                      Reject Course
                    </DropdownMenuItem>
                  )}
                  {course.status === "rejected" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                      <Clock className="mr-2 h-4 w-4" />
                      Approve Course
                    </DropdownMenuItem>
                  )}
                  {course.status === "pending" && (
                    <>
                      <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                        <Clock className="mr-2 h-4 w-4" />
                        Approve Course
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                        <Clock className="mr-2 h-4 w-4" />
                        Reject Course
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-full lg:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="mt-1">{course.description}</CardDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge
                        variant={
                          course.status === "approved" ? "default" :
                            course.status === "pending" ? "outline" :
                              "destructive"
                        }
                      >
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>
                        {course.currentEnrollment}/{course.capacity} students enrolled
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <Video className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">Avg. Score</div>
                      <div className="text-2xl font-bold">{course.averageScore || 0}%</div>
                    </div>
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">Engagement</div>
                      <div className="text-2xl font-bold">{course.studentEngagement || 0}%</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Session Types</div>
                    <div className="flex flex-wrap gap-2">
                      {course.sessionTypes.includes("online") && course.pricing?.online && (
                        <Badge variant="outline" className="bg-background">
                          Online: ${course.pricing.online.price}
                        </Badge>
                      )}
                      {course.sessionTypes.includes("group") && course.pricing?.group && (
                        <Badge variant="outline" className="bg-background">
                          Group: ${course.pricing.group.price}
                        </Badge>
                      )}
                      {course.sessionTypes.includes("oneOnOne") && course.pricing?.oneOnOne && (
                        <Badge variant="outline" className="bg-background">
                          1-on-1: ${course.pricing.oneOnOne.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{course.currentEnrollment}</div>
                      <p className="text-xs text-muted-foreground">
                        {course.capacity - course.currentEnrollment} spots remaining
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{course.completionRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(course.currentEnrollment * ( course.completionRate || 10 / 100))} students completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{course.averageScore || 0}%</div>
                      <p className="text-xs text-muted-foreground">Across all assessments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Next Session</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-md font-medium">
                        {upcomingSessions.length > 0
                          ? new Date(upcomingSessions[0].date).toLocaleDateString()
                          : "No upcoming sessions"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {upcomingSessions.length > 0
                          ? new Date(upcomingSessions[0].date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "Schedule a session"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                      <CardTitle>Course Progress</CardTitle>
                      <CardDescription>Module completion by students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.modules.length > 0 ? (
                        <div className="space-y-4">
                          {course.modules.map((module, i) => {
                            const moduleCompletion = course.modules.length 
                            return (
                              <div key={module._id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{module.title}</span>
                                  <span>
                                    {moduleCompletion}/{course.currentEnrollment} students
                                  </span>
                                </div>
                                <Progress
                                  value={(moduleCompletion / course.currentEnrollment) * 100}
                                  className="h-2"
                                />
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No modules yet</h3>
                          <p className="text-sm text-muted-foreground mt-1">Add modules to your course</p>
                          <Button className="mt-4" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Module
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Upcoming Sessions</CardTitle>
                      <CardDescription>Your scheduled sessions for this course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingSessions.length > 0 ? (
                          upcomingSessions.slice(0, 3).map((session) => (
                            <div key={session._id} className="flex items-center">
                              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                {session.type === "group" ? (
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{session.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.date).toLocaleDateString()} at{" "}
                                  {new Date(session.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" • "}
                                  {session.duration} min
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium">No upcoming sessions</h3>
                            <p className="text-sm text-muted-foreground mt-1">Schedule a session for this course</p>
                            <Button className="mt-4" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Schedule Session
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    {upcomingSessions.length > 0 && (
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/tutor/courses/${course._id}/sessions`}>View All Sessions</Link>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </TabsContent>


              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Course Content</CardTitle>
                      <CardDescription>View your course modules</CardDescription>
                    </div>
                    <Button asChild>
                      <Link href={`/tutor/courses/${courseId}/modules`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Manage Modules
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {course.modules.length > 0 ? (
                      <div className="space-y-4">
                        {course.modules.map((module) => (
                          <div key={module._id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-muted/50">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border">
                                  <span className="font-medium">{module.order}</span>
                                </div>
                                <div>
                                  <h3 className="font-medium flex items-center gap-2">
                                    {module.title}
                                    {module.isPublished && (
                                      <Badge variant="default">
                                        Published
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {module.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                                  {module.type === 'video' && <Video className="h-4 w-4" />}
                                  {module.type === 'text' && <FileText className="h-4 w-4" />}
                                  {module.type === 'quiz' && <ListChecks className="h-4 w-4" />}
                                  {module.type === 'assignment' && <FileQuestion className="h-4 w-4" />}
                                  {module.type}
                                  {module.duration > 0 && ` • ${module.duration} min`}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4 border-t">
                              {module.type === 'video' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Video className="h-4 w-4" />
                                  <span>Video content</span>
                                </div>
                              )}
                              {module.type === 'text' && (
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {module.content}
                                </div>
                              )}
                              {module.type === 'quiz' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <ListChecks className="h-4 w-4" />
                                  <span>Quiz content</span>
                                </div>
                              )}
                              {module.type === 'assignment' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <FileQuestion className="h-4 w-4" />
                                  <span>Assignment details</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No modules yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create your first module in the management page
                        </p>
                        <Button className="mt-4" asChild>
                          <Link href={`/tutor/courses/${courseId}/modules`}>
                            Go to Modules
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Enrolled Students</CardTitle>
                      <CardDescription>
                        {course.currentEnrollment} students enrolled ({course.capacity - course.currentEnrollment} spots remaining)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                      </Button>
                      <Button variant="outline" size="sm">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {students.length > 0 ? (
                      <div className="space-y-4">
                        {students.map((student) => (
                          <div key={student._id} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge
                                variant={
                                  student.enrollmentType === "oneOnOne"
                                    ? "default"
                                    : student.enrollmentType === "group"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {student.enrollmentType === "oneOnOne"
                                  ? "1-on-1"
                                  : student.enrollmentType === "group"
                                    ? "Group"
                                    : "Online"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <span>Progress:</span>
                                <span className="font-medium">{student.progress}%</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Last active: {new Date(student.lastActive).toLocaleDateString()}
                              </div>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No students enrolled</h3>
                        <p className="text-sm text-muted-foreground mt-1">Students will appear here when they enroll</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Upcoming Sessions</CardTitle>
                      <CardDescription>Manage your scheduled sessions for this course</CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Session
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                          <div key={session._id} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                {session.type === "group" ? (
                                  <Users className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <User className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{session.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(session.date).toLocaleDateString()} at{" "}
                                  {new Date(session.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" • "}
                                  {session.duration} min
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={session.type === "oneOnOne" ? "default" : "secondary"}>
                                {session.type === "oneOnOne" ? "1-on-1" : "Group"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                <span>
                                  {session.attendees}/{session.maxAttendees}
                                </span>
                              </div>
                              <Button variant="outline" size="sm">
                                Start Session
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit session</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No upcoming sessions</h3>
                        <p className="text-sm text-muted-foreground mt-1">Schedule a session for this course</p>
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule Session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Past Sessions</CardTitle>
                    <CardDescription>View your completed sessions for this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pastSessions.length > 0 ? (
                      <div className="space-y-4">
                        {pastSessions.map((session) => (
                          <div key={session._id} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                {session.type === "group" ? (
                                  <Users className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <User className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{session.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(session.date).toLocaleDateString()} at{" "}
                                  {new Date(session.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" • "}
                                  {session.duration} min
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={session.type === "oneOnOne" ? "default" : "secondary"}>
                                {session.type === "oneOnOne" ? "1-on-1" : "Group"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                <span>
                                  {session.attendees}/{session.maxAttendees}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No past sessions</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your completed sessions will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>Course Analytics</CardTitle>
                      <CardDescription>Performance metrics for your course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Module Completion</CardTitle>
                      <CardDescription>Student progress through modules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.modules.length > 0 ? (
                        <div className="space-y-4">
                          {course.modules.map((module) => {
                            const moduleCompletion = course.modules.length || 0
                            return (
                              <div key={module._id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="truncate">{module.title}</span>
                                  <span className="font-medium">
                                    {Math.round((moduleCompletion / course.currentEnrollment) * 100)}%
                                  </span>
                                </div>
                                <Progress
                                  value={(moduleCompletion / course.currentEnrollment) * 100}
                                  className="h-2"
                                />
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">No modules yet</h3>
                          <p className="text-sm text-muted-foreground mt-1">Add modules to track progress</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-full md:col-span-1">
                    <CardHeader>
                      <CardTitle>Student Engagement</CardTitle>
                      <CardDescription>Activity metrics for enrolled students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <LineChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>Enrollment Trends</CardTitle>
                      <CardDescription>New students enrolled over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

interface UserProps {
  className?: string;
}

function User({ className }: UserProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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