
"use client"

import { useState } from "react"
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

// Mock course data
const coursesData = [
  {
    id: "1",
    title: "Advanced JavaScript Programming",
    description:
      "Master modern JavaScript concepts and techniques for web development. Learn ES6+, async programming, functional concepts, and more.",
    category: "Programming",
    level: "Advanced",
    status: "active",
    studentCount: 24,
    maxStudents: 30,
    completionRate: 68,
    rating: 4.8,
    reviews: 18,
    image: "/placeholder.svg?height=300&width=600",
    sessions: {
      online: true,
      group: true,
      oneOnOne: true,
    },
    pricing: {
      online: 49.99,
      group: 99.99,
      oneOnOne: 199.99,
    },
    nextSession: "Tomorrow, 10:00 AM",
    modules: [
      {
        id: "m1",
        title: "Introduction to Advanced JavaScript",
        lessons: [
          { id: "l1", title: "Course Overview", type: "video", duration: "10:15", completed: 24 },
          { id: "l2", title: "JavaScript Fundamentals Recap", type: "video", duration: "15:30", completed: 22 },
          { id: "l3", title: "Setting Up Your Development Environment", type: "text", duration: "5:00", completed: 20 },
          { id: "l4", title: "Module 1 Quiz", type: "quiz", questions: 10, completed: 18 },
        ],
      },
      {
        id: "m2",
        title: "ES6+ Features",
        lessons: [
          { id: "l5", title: "Arrow Functions", type: "video", duration: "12:45", completed: 19 },
          { id: "l6", title: "Destructuring", type: "video", duration: "14:20", completed: 17 },
          { id: "l7", title: "Template Literals", type: "video", duration: "8:10", completed: 16 },
          { id: "l8", title: "Spread and Rest Operators", type: "video", duration: "11:30", completed: 15 },
          { id: "l9", title: "ES6+ Features Practice", type: "assignment", duration: "45:00", completed: 14 },
        ],
      },
      {
        id: "m3",
        title: "Asynchronous JavaScript",
        lessons: [
          { id: "l10", title: "Callbacks and Callback Hell", type: "video", duration: "18:30", completed: 12 },
          { id: "l11", title: "Promises", type: "video", duration: "22:15", completed: 10 },
          { id: "l12", title: "Async/Await", type: "video", duration: "20:45", completed: 8 },
          {
            id: "l13",
            title: "Asynchronous Programming Exercise",
            type: "assignment",
            duration: "60:00",
            completed: 7,
          },
          { id: "l14", title: "Module 3 Quiz", type: "quiz", questions: 15, completed: 6 },
        ],
      },
      {
        id: "m4",
        title: "Functional Programming Concepts",
        lessons: [
          { id: "l15", title: "Pure Functions", type: "video", duration: "15:20", completed: 5 },
          { id: "l16", title: "Higher-Order Functions", type: "video", duration: "17:45", completed: 4 },
          { id: "l17", title: "Function Composition", type: "video", duration: "14:30", completed: 3 },
          { id: "l18", title: "Immutability", type: "video", duration: "12:10", completed: 2 },
        ],
      },
      {
        id: "m5",
        title: "Final Project",
        lessons: [
          { id: "l19", title: "Project Requirements", type: "text", duration: "10:00", completed: 1 },
          { id: "l20", title: "Project Submission", type: "assignment", duration: "120:00", completed: 0 },
          { id: "l21", title: "Final Assessment", type: "quiz", questions: 30, completed: 0 },
        ],
      },
    ],
    upcomingSessions: [
      {
        id: "s1",
        type: "group",
        title: "ES6+ Features Deep Dive",
        date: "2023-05-15T10:00:00Z",
        duration: 90,
        attendees: 12,
        maxAttendees: 15,
      },
      {
        id: "s2",
        type: "oneOnOne",
        title: "JavaScript Project Review",
        date: "2023-05-16T14:30:00Z",
        duration: 60,
        attendees: 1,
        maxAttendees: 1,
        student: {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      },
      {
        id: "s3",
        type: "group",
        title: "Asynchronous JavaScript Workshop",
        date: "2023-05-18T11:00:00Z",
        duration: 120,
        attendees: 8,
        maxAttendees: 15,
      },
    ],
    enrolledStudents: [
      {
        id: "st1",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 85,
        enrollmentType: "oneOnOne",
        lastActive: "2023-05-14T09:45:00Z",
      },
      {
        id: "st2",
        name: "Michael Johnson",
        email: "michael.johnson@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 72,
        enrollmentType: "group",
        lastActive: "2023-05-13T16:20:00Z",
      },
      {
        id: "st3",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 94,
        enrollmentType: "online",
        lastActive: "2023-05-14T11:10:00Z",
      },
      {
        id: "st4",
        name: "Robert Wilson",
        email: "robert.wilson@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 45,
        enrollmentType: "group",
        lastActive: "2023-05-12T14:30:00Z",
      },
      {
        id: "st5",
        name: "Sarah Brown",
        email: "sarah.brown@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 68,
        enrollmentType: "online",
        lastActive: "2023-05-14T08:15:00Z",
      },
    ],
    analytics: {
      completionRate: 68,
      averageScore: 82,
      studentEngagement: 76,
      weeklyEnrollment: [4, 6, 3, 5, 2, 1, 3],
      moduleCompletion: [
        { name: "Module 1", completed: 20, total: 24 },
        { name: "Module 2", completed: 16, total: 24 },
        { name: "Module 3", completed: 10, total: 24 },
        { name: "Module 4", completed: 5, total: 24 },
        { name: "Module 5", completed: 1, total: 24 },
      ],
      assessmentScores: [
        { name: "Quiz 1", average: 85 },
        { name: "Assignment 1", average: 78 },
        { name: "Quiz 2", average: 82 },
        { name: "Assignment 2", average: 76 },
        { name: "Final Assessment", average: 0 },
      ],
    },
  },
]

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = coursesData.find((c) => c.id === courseId) || coursesData[0]
  const [activeTab, setActiveTab] = useState("overview")

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
                <Link href={`/tutor/courses/${course.id}/edit`}>
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
                  {course.status === "active" ? (
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Deactivate Course
                    </DropdownMenuItem>
                  ) : course.status === "inactive" ? (
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Activate Course
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Publish Course
                    </DropdownMenuItem>
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
                          course.status === "active" ? "default" : course.status === "draft" ? "outline" : "secondary"
                        }
                      >
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <Star className="mr-1 h-5 w-5 fill-primary text-primary" />
                      <span className="text-xl font-bold">{course.rating}</span>
                      <span className="ml-1 text-sm text-muted-foreground">({course.reviews} reviews)</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>
                        {course.studentCount}/{course.maxStudents} students enrolled
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden rounded-md border">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
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
                      <div className="text-2xl font-bold">{course.analytics.averageScore}%</div>
                    </div>
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">Engagement</div>
                      <div className="text-2xl font-bold">{course.analytics.studentEngagement}%</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Session Types</div>
                    <div className="flex flex-wrap gap-2">
                      {course.sessions.online && (
                        <Badge variant="outline" className="bg-background">
                          Online: ${course.pricing.online}
                        </Badge>
                      )}
                      {course.sessions.group && (
                        <Badge variant="outline" className="bg-background">
                          Group: ${course.pricing.group}
                        </Badge>
                      )}
                      {course.sessions.oneOnOne && (
                        <Badge variant="outline" className="bg-background">
                          1-on-1: ${course.pricing.oneOnOne}
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
                      <div className="text-2xl font-bold">{course.studentCount}</div>
                      <p className="text-xs text-muted-foreground">
                        {course.maxStudents - course.studentCount} spots remaining
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
                        {Math.round(course.studentCount * (course.completionRate / 100))} students completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{course.analytics.averageScore}%</div>
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
                        {course.upcomingSessions && course.upcomingSessions.length > 0
                          ? new Date(course.upcomingSessions[0].date).toLocaleDateString()
                          : "No upcoming sessions"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {course.upcomingSessions && course.upcomingSessions.length > 0
                          ? new Date(course.upcomingSessions[0].date).toLocaleTimeString([], {
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
                      <div className="space-y-4">
                        {course.analytics.moduleCompletion.map((module, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{module.name}</span>
                              <span>
                                {module.completed}/{module.total} students
                              </span>
                            </div>
                            <Progress value={(module.completed / module.total) * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Upcoming Sessions</CardTitle>
                      <CardDescription>Your scheduled sessions for this course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {course.upcomingSessions && course.upcomingSessions.length > 0 ? (
                          course.upcomingSessions.slice(0, 3).map((session, i) => (
                            <div key={i} className="flex items-center">
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
                    {course.upcomingSessions && course.upcomingSessions.length > 0 && (
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/tutor/courses/${course.id}/sessions`}>View All Sessions</Link>
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
                      <CardDescription>Manage your course modules and lessons</CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Module
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="rounded-lg border">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                {moduleIndex + 1}
                              </span>
                              <h3 className="font-medium">{module.title}</h3>
                              <Badge variant="outline" className="ml-2">
                                {module.lessons.length} lessons
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit module</span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Add lesson</span>
                              </Button>
                            </div>
                          </div>
                          <div className="border-t">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between border-b last:border-b-0 p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">
                                    {moduleIndex + 1}.{lessonIndex + 1}
                                  </span>
                                  {lesson.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                                  {lesson.type === "text" && <FileText className="h-4 w-4 text-muted-foreground" />}
                                  {lesson.type === "quiz" && (
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  {lesson.type === "assignment" && (
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-1 h-4 w-4" />
                                    <span>
                                      {lesson.completed}/{course.studentCount}
                                    </span>
                                  </div>
                                  {lesson.duration && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Clock className="mr-1 h-4 w-4" />
                                      <span>{lesson.duration}</span>
                                    </div>
                                  )}
                                  {lesson.questions && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <MessageSquare className="mr-1 h-4 w-4" />
                                      <span>{lesson.questions} questions</span>
                                    </div>
                                  )}
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit lesson</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Enrolled Students</CardTitle>
                      <CardDescription>
                        {course.studentCount} students enrolled ({course.maxStudents - course.studentCount} spots remaining)
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
                    <div className="space-y-4">
                      {course.enrolledStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
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
                    {course.upcomingSessions && course.upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {course.upcomingSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
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
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No past sessions</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your completed sessions will appear here
                      </p>
                    </div>
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
                      <CardTitle>Assessment Scores</CardTitle>
                      <CardDescription>Average scores by assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {course.analytics.assessmentScores.map((assessment) => (
                          <div key={assessment.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{assessment.name}</span>
                              <span className="font-medium">{assessment.average}%</span>
                            </div>
                            <Progress value={assessment.average} className="h-2" />
                          </div>
                        ))}
                      </div>
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
                      <CardTitle>Weekly Enrollment</CardTitle>
                      <CardDescription>New students enrolled per week</CardDescription>
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