"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Video, File, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface Tutor {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface Section {
  title: string
  order: number
  type: 'text' | 'video' | 'pdf' | 'quiz'
  content?: string
  videoUrl?: string
  pdfUrl?: string
  quiz?: any
}

interface Module {
  _id: string
  title: string
  content: string
  order: number
  isPublished: boolean
  sections: Section[]
  createdAt: string
  updatedAt: string
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  deadline: Date
  tutor: Tutor
  modules: Module[]
  sessionTypes: string[]
  pricing: {
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
  prerequisites: string[]
  status: string
  capacity: number
  waitingListCapacity: number
  currentEnrollment: number
  waitingList: string[]
  createdAt: string
  updatedAt: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        const response = await fetch(`${apiUrl}/api/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Failed to fetch course details')

        const data = await response.json()
        setCourse(data)
        
        // Initialize expanded state for modules
        const initialExpandedState: Record<string, boolean> = {}
        data.modules.forEach((module: Module) => {
          initialExpandedState[module._id] = false
        })
        setExpandedModules(initialExpandedState)
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

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4 mr-2" />
      case 'video':
        return <Video className="h-4 w-4 mr-2" />
      case 'pdf':
        return <File className="h-4 w-4 mr-2" />
      case 'quiz':
        return <AlertTriangle className="h-4 w-4 mr-2" />
      default:
        return <FileText className="h-4 w-4 mr-2" />
    }
  }

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
                  <h1 className="text-lg font-semibold">Course Details</h1>
                  <p className="text-sm text-muted-foreground">Loading course information...</p>
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
                  <h1 className="text-lg font-semibold">Course Details</h1>
                  <p className="text-sm text-muted-foreground">Course not found</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Course Not Found</AlertTitle>
                <AlertDescription>
                  The course you're looking for could not be found. Please return to the courses page and try again.
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  const enrollmentPercentage = Math.round((course.currentEnrollment / course.capacity) * 100)

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
                <h1 className="text-lg font-semibold">Course Details</h1>
                <p className="text-sm text-muted-foreground">{course.title}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/student/courses/${course._id}/checkout`}>
                Enroll Now
              </Link>
            </Button>
          </div>

          <div className="flex-1 p-8 pt-6">
            <div className="grid gap-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Course</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Description</Label>
                        <p className="mt-1 text-sm">{course.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <p className="mt-1 text-sm capitalize">{course.category}</p>
                        </div>
                        <div>
                          <Label>Level</Label>
                          <p className="mt-1 text-sm capitalize">{course.level}</p>
                        </div>
                        <div>
                          <Label>Application Deadline</Label>
                          <p className="mt-1 text-sm">
                            {new Date(course.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label>Course Status</Label>
                          <p className="mt-1 text-sm capitalize">{course.status}</p>
                        </div>
                      </div>

                      {course.prerequisites.length > 0 && (
                        <div>
                          <Label>Prerequisites</Label>
                          <ul className="mt-1 list-disc list-inside text-sm">
                            {course.prerequisites.map((prereq, index) => (
                              <li key={index}>{prereq}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Curriculum</CardTitle>
                      <CardDescription>
                        {course.modules.length} modules • {course.modules.reduce((acc, module) => acc + module.sections.length, 0)} sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {course.modules
                        .sort((a, b) => a.order - b.order)
                        .map((module) => (
                          <div key={module._id} className="border rounded-md overflow-hidden">
                            <button
                              onClick={() => toggleModule(module._id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center">
                                <span className="font-medium">{module.title}</span>
                                <Badge variant="outline" className="ml-2">
                                  {module.sections.length} sections
                                </Badge>
                              </div>
                              {expandedModules[module._id] ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            
                            {expandedModules[module._id] && (
                              <div className="border-t p-4 bg-muted/10">
                                <p className="text-sm text-muted-foreground mb-3">{module.content}</p>
                                <div className="space-y-2">
                                  {module.sections
                                    .sort((a, b) => a.order - b.order)
                                    .map((section) => (
                                      <div key={`${module._id}-${section.order}`} className="flex items-center p-2 rounded hover:bg-muted/50">
                                        {getSectionIcon(section.type)}
                                        <span className="text-sm">{section.title}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tutor Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={course.tutor.avatar} />
                          <AvatarFallback>
                            {course.tutor.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{course.tutor.name}</h3>
                          <p className="text-sm text-muted-foreground">{course.tutor.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Enrollment Progress</span>
                          <span>{course.currentEnrollment}/{course.capacity} students</span>
                        </div>
                        <Progress value={enrollmentPercentage} className="h-2" />
                      </div>

                      {course.waitingListCapacity > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Waiting List</span>
                            <span>{course.waitingList.length}/{course.waitingListCapacity} students</span>
                          </div>
                          <Progress 
                            value={Math.round((course.waitingList.length / course.waitingListCapacity) * 100)} 
                            className="h-2" 
                          />
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="font-medium">Available Session Types</h3>
                        <div className="space-y-2">
                          {course.sessionTypes.includes('online') && course.pricing.online && (
                            <div className="flex justify-between p-2 border rounded">
                              <span>Online Course</span>
                              <span className="font-medium">${course.pricing.online.price}</span>
                            </div>
                          )}
                          {course.sessionTypes.includes('group') && course.pricing.group && (
                            <div className="flex justify-between p-2 border rounded">
                              <span>Group Sessions</span>
                              <span className="font-medium">${course.pricing.group.price}</span>
                            </div>
                          )}
                          {course.sessionTypes.includes('oneOnOne') && course.pricing.oneOnOne && (
                            <div className="flex justify-between p-2 border rounded">
                              <span>1-on-1 Sessions</span>
                              <span className="font-medium">${course.pricing.oneOnOne.price}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/student/checkout/${course._id}`}>
                          Enroll Now
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}