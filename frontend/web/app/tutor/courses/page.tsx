"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  deadline: Date
  status: "pending" | "approved" | "rejected"
  currentEnrollment: number
  capacity: number
  sessionTypes: ("online" | "group" | "oneOnOne")[]
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
  tutor: string
  modules: string[]
  quizzes: string[]
  prerequisites: string[]
  waitingListCapacity: number
  waitingList: string[]
  createdAt: Date
  updatedAt: Date
}

interface CourseCardProps {
  course: Course
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        console.log(token)
        const response = await fetch('http://localhost:5000/api/course', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }

        const data = await response.json()
        setCourses(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch courses",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [toast])

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Group courses by status for the tabs
  const pendingCourses = filteredCourses.filter((course) => course.status === "pending")
  const approvedCourses = filteredCourses.filter((course) => course.status === "approved")
  const rejectedCourses = filteredCourses.filter((course) => course.status === "rejected")

  const handleStatusChange = async (courseId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
      console.log(token)
      const response = await fetch(`http://localhost:5000/api/course/${courseId}/status`, {
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

      setCourses(courses.map(course => 
        course._id === courseId ? { ...course, status: newStatus } : course
      ))

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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">My Courses</h1>
                <p className="text-sm text-muted-foreground">Loading your courses...</p>
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

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">My Courses</h1>
              <p className="text-sm text-muted-foreground">Manage your courses and sessions</p>
            </div>
            <Button asChild>
              <Link href="/tutor/create-course">
                <Plus className="mr-2 h-4 w-4" />
                Create New Course
              </Link>
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(courses.map(course => course.category))).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCourses.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedCourses.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedCourses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No courses found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Try adjusting your filters or search query"
                          : "Create your first course to get started"}
                      </p>
                      {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
                        <Button className="mt-4" asChild>
                          <Link href="/tutor/create-course">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Course
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {pendingCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No pending courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">All your courses have been reviewed</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingCourses.map((course) => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {approvedCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No approved courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your courses are pending review</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {approvedCourses.map((course) => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No rejected courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">All your courses have been approved</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rejectedCourses.map((course) => (
                      <CourseCard 
                        key={course._id} 
                        course={course} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function CourseCard({ course, onStatusChange }: CourseCardProps & { onStatusChange: (id: string, status: "pending" | "approved" | "rejected") => void }) {
  const hasOnline = course.sessionTypes.includes("online")
  const hasGroup = course.sessionTypes.includes("group")
  const hasOneOnOne = course.sessionTypes.includes("oneOnOne")

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src="/placeholder.svg"
          alt={course.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              course.status === "approved" ? "default" : 
              course.status === "pending" ? "outline" : 
              "destructive"
            }
            className="mb-2"
          >
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tutor/courses/${course._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tutor/courses/${course._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {course.status === "approved" && (
                <DropdownMenuItem onClick={() => onStatusChange(course._id, "rejected")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Reject Course
                </DropdownMenuItem>
              )}
              {course.status === "rejected" && (
                <DropdownMenuItem onClick={() => onStatusChange(course._id, "approved")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Approve Course
                </DropdownMenuItem>
              )}
              {course.status === "pending" && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(course._id, "approved")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Approve Course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(course._id, "rejected")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Reject Course
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2 mt-1">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" />
            {course.level}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {course.currentEnrollment}/{course.capacity}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {hasOnline && course.pricing.online && (
            <Badge variant="outline" className="bg-background">
              Online: ${course.pricing.online.price}
            </Badge>
          )}
          {hasGroup && course.pricing.group && (
            <Badge variant="outline" className="bg-background">
              Group: ${course.pricing.group.price}
            </Badge>
          )}
          {hasOneOnOne && course.pricing.oneOnOne && (
            <Badge variant="outline" className="bg-background">
              1-on-1: ${course.pricing.oneOnOne.price}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/tutor/courses/${course._id}`}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Manage Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}