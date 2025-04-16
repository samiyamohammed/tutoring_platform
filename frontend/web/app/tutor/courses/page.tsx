"use client"

import { useState } from "react"
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

interface Course {
  id: number
  title: string
  description: string
  category: string
  level: string
  status: "active" | "draft" | "inactive"
  students: number
  maxStudents: number
  rating: number
  reviews: number
  image: string
  sessions: {
    online: boolean
    group: boolean
    oneOnOne: boolean
  }
  pricing: {
    online: number
    group: number
    oneOnOne: number
  }
  nextSession: string | null
}

// Mock data for courses
const courses: Course[] = [
  {
    id: 1,
    title: "Advanced JavaScript Programming",
    description: "Master modern JavaScript concepts and techniques for web development.",
    category: "Programming",
    level: "Advanced",
    status: "active",
    students: 24,
    maxStudents: 30,
    rating: 4.8,
    reviews: 18,
    image: "/placeholder.svg?height=150&width=300",
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
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and experience design.",
    category: "Design",
    level: "Beginner",
    status: "active",
    students: 18,
    maxStudents: 25,
    rating: 4.6,
    reviews: 12,
    image: "/placeholder.svg?height=150&width=300",
    sessions: {
      online: true,
      group: true,
      oneOnOne: false,
    },
    pricing: {
      online: 39.99,
      group: 89.99,
      oneOnOne: 0,
    },
    nextSession: "Friday, 2:00 PM",
  },
  {
    id: 3,
    title: "Data Science with Python",
    description: "Explore data analysis, visualization, and machine learning with Python.",
    category: "Data Science",
    level: "Intermediate",
    status: "draft",
    students: 0,
    maxStudents: 20,
    rating: 0,
    reviews: 0,
    image: "/placeholder.svg?height=150&width=300",
    sessions: {
      online: true,
      group: true,
      oneOnOne: true,
    },
    pricing: {
      online: 59.99,
      group: 119.99,
      oneOnOne: 249.99,
    },
    nextSession: null,
  },
  {
    id: 4,
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native.",
    category: "Programming",
    level: "Intermediate",
    status: "inactive",
    students: 15,
    maxStudents: 20,
    rating: 4.5,
    reviews: 8,
    image: "/placeholder.svg?height=150&width=300",
    sessions: {
      online: true,
      group: false,
      oneOnOne: true,
    },
    pricing: {
      online: 54.99,
      group: 0,
      oneOnOne: 219.99,
    },
    nextSession: null,
  },
]

interface CourseCardProps {
  course: Course
}

export default function TutorCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

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
  const activeCourses = filteredCourses.filter((course) => course.status === "active")
  const draftCourses = filteredCourses.filter((course) => course.status === "draft")
  const inactiveCourses = filteredCourses.filter((course) => course.status === "inactive")

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
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
                <TabsTrigger value="active">Active ({activeCourses.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftCourses.length})</TabsTrigger>
                <TabsTrigger value="inactive">Inactive ({inactiveCourses.length})</TabsTrigger>
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
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {activeCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No active courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">Publish a course to make it active</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="draft" className="space-y-4">
                {draftCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No draft courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">Start creating a new course</p>
                      <Button className="mt-4" asChild>
                        <Link href="/tutor/create-course">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Course
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {draftCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4">
                {inactiveCourses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No inactive courses</h3>
                      <p className="text-sm text-muted-foreground mt-1">You don't have any inactive courses</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inactiveCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
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

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge
            variant={course.status === "active" ? "default" : course.status === "draft" ? "outline" : "secondary"}
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
                <Link href={`/tutor/courses/${course.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tutor/courses/${course.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
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
            {course.students}/{course.maxStudents}
          </div>
          {course.rating > 0 && (
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
              {course.rating} ({course.reviews})
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
          {course.sessions.oneOnOne && course.pricing.oneOnOne > 0 && (
            <Badge variant="outline" className="bg-background">
              1-on-1: ${course.pricing.oneOnOne}
            </Badge>
          )}
        </div>
        {course.nextSession && (
          <div className="mt-3 flex items-center text-sm">
            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>Next: {course.nextSession}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/tutor/courses/${course.id}`}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Manage Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}