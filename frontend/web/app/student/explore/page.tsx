"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Filter, Search, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Define types for our data
type Tutor = {
  name: string
  avatar: string
  rating: number
}

type Sessions = {
  online: boolean
  group: boolean
  oneOnOne: boolean
}

type Pricing = {
  online: number
  group: number
  oneOnOne: number
}

type Course = {
  id: number
  title: string
  description: string
  category: string
  level: string
  tutor: Tutor
  students: number
  maxStudents: number
  rating: number
  reviews: number
  image: string
  sessions: Sessions
  pricing: Pricing
  tags: string[]
}

// Mock data for courses
const courses: Course[] = [
  {
    id: 1,
    title: "Advanced JavaScript Programming",
    description: "Master modern JavaScript concepts and techniques for web development.",
    category: "Programming",
    level: "Advanced",
    tutor: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
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
    tags: ["JavaScript", "Web Development", "ES6+"],
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and experience design.",
    category: "Design",
    level: "Beginner",
    tutor: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
    },
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
    tags: ["UI Design", "UX Design", "Figma"],
  },
  {
    id: 3,
    title: "Data Science with Python",
    description: "Explore data analysis, visualization, and machine learning with Python.",
    category: "Data Science",
    level: "Intermediate",
    tutor: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
    },
    students: 15,
    maxStudents: 20,
    rating: 4.7,
    reviews: 9,
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
    tags: ["Python", "Data Science", "Machine Learning"],
  },
  {
    id: 4,
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native.",
    category: "Programming",
    level: "Intermediate",
    tutor: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
    },
    students: 12,
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
    tags: ["React Native", "Mobile Development", "JavaScript"],
  },
  {
    id: 5,
    title: "Digital Marketing Masterclass",
    description: "Learn effective digital marketing strategies for business growth.",
    category: "Marketing",
    level: "All Levels",
    tutor: {
      name: "Robert Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
    students: 30,
    maxStudents: 50,
    rating: 4.9,
    reviews: 25,
    image: "/placeholder.svg?height=150&width=300",
    sessions: {
      online: true,
      group: true,
      oneOnOne: true,
    },
    pricing: {
      online: 69.99,
      group: 129.99,
      oneOnOne: 299.99,
    },
    tags: ["Digital Marketing", "SEO", "Social Media"],
  },
  {
    id: 6,
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms and applications.",
    category: "Data Science",
    level: "Advanced",
    tutor: {
      name: "Jennifer Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
    },
    students: 20,
    maxStudents: 25,
    rating: 4.7,
    reviews: 15,
    image: "/placeholder.svg?height=150&width=300",
    sessions: {
      online: true,
      group: true,
      oneOnOne: true,
    },
    pricing: {
      online: 79.99,
      group: 149.99,
      oneOnOne: 349.99,
    },
    tags: ["Machine Learning", "AI", "Python"],
  },
]

// Define props for components
interface CourseCardProps {
  course: Course
}

interface AvatarProps {
  className?: string
  children: React.ReactNode
}

interface AvatarImageProps {
  src: string
  alt: string
}

interface AvatarFallbackProps {
  children: React.ReactNode
}

export default function ExploreCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [sessionTypeFilters, setSessionTypeFilters] = useState({
    online: false,
    group: false,
    oneOnOne: false,
  })
  const [priceRange, setPriceRange] = useState([0, 350])
  const [sortBy, setSortBy] = useState("popular")

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesLevel = levelFilter === "all" || course.level === levelFilter

    const matchesSessionType =
      (!sessionTypeFilters.online && !sessionTypeFilters.group && !sessionTypeFilters.oneOnOne) ||
      (sessionTypeFilters.online && course.sessions.online) ||
      (sessionTypeFilters.group && course.sessions.group) ||
      (sessionTypeFilters.oneOnOne && course.sessions.oneOnOne)

    const lowestPrice = Math.min(
      course.pricing.online || Number.POSITIVE_INFINITY,
      course.pricing.group || Number.POSITIVE_INFINITY,
      course.pricing.oneOnOne || Number.POSITIVE_INFINITY,
    )

    const highestPrice = Math.max(course.pricing.online || 0, course.pricing.group || 0, course.pricing.oneOnOne || 0)

    const matchesPrice =
      (lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1]) ||
      (highestPrice >= priceRange[0] && highestPrice <= priceRange[1])

    return matchesSearch && matchesCategory && matchesLevel && matchesSessionType && matchesPrice
  })

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.students - a.students
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.id - a.id
      case "priceAsc":
        return (
          Math.min(
            a.pricing.online || Number.POSITIVE_INFINITY,
            a.pricing.group || Number.POSITIVE_INFINITY,
            a.pricing.oneOnOne || Number.POSITIVE_INFINITY,
          ) -
          Math.min(
            b.pricing.online || Number.POSITIVE_INFINITY,
            b.pricing.group || Number.POSITIVE_INFINITY,
            b.pricing.oneOnOne || Number.POSITIVE_INFINITY,
          )
        )
      case "priceDesc":
        return (
          Math.min(
            b.pricing.online || Number.POSITIVE_INFINITY,
            b.pricing.group || Number.POSITIVE_INFINITY,
            b.pricing.oneOnOne || Number.POSITIVE_INFINITY,
          ) -
          Math.min(
            a.pricing.online || Number.POSITIVE_INFINITY,
            a.pricing.group || Number.POSITIVE_INFINITY,
            a.pricing.oneOnOne || Number.POSITIVE_INFINITY,
          )
        )
      default:
        return 0
    }
  })

  const resetFilters = () => {
    setCategoryFilter("all")
    setLevelFilter("all")
    setSessionTypeFilters({
      online: false,
      group: false,
      oneOnOne: false,
    })
    setPriceRange([0, 350])
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Explore Courses</h1>
              <p className="text-sm text-muted-foreground">Discover courses from top tutors</p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Courses</SheetTitle>
                    <SheetDescription>Narrow down courses based on your preferences</SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Category</h3>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Level</h3>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Session Type</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="online"
                            checked={sessionTypeFilters.online}
                            onCheckedChange={(checked) =>
                              setSessionTypeFilters({ ...sessionTypeFilters, online: !!checked })
                            }
                          />
                          <label
                            htmlFor="online"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Online Course
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="group"
                            checked={sessionTypeFilters.group}
                            onCheckedChange={(checked) =>
                              setSessionTypeFilters({ ...sessionTypeFilters, group: !!checked })
                            }
                          />
                          <label
                            htmlFor="group"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Group Sessions
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="oneOnOne"
                            checked={sessionTypeFilters.oneOnOne}
                            onCheckedChange={(checked) =>
                              setSessionTypeFilters({ ...sessionTypeFilters, oneOnOne: !!checked })
                            }
                          />
                          <label
                            htmlFor="oneOnOne"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            One-on-One Sessions
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Price Range</h3>
                        <span className="text-sm text-muted-foreground">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0, 350]}
                        max={350}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="py-4"
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {filteredCourses.length} {filteredCourses.length === 1 ? "Course" : "Courses"} Found
                </h2>
                <div className="flex items-center gap-2">
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {categoryFilter}
                      <button
                        onClick={() => setCategoryFilter("all")}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                  {levelFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {levelFilter}
                      <button onClick={() => setLevelFilter("all")} className="ml-1 rounded-full hover:bg-secondary/80">
                        ✕
                      </button>
                    </Badge>
                  )}
                  {(sessionTypeFilters.online || sessionTypeFilters.group || sessionTypeFilters.oneOnOne) && (
                    <Badge variant="secondary" className="gap-1">
                      Session Types
                      <button
                        onClick={() =>
                          setSessionTypeFilters({
                            online: false,
                            group: false,
                            oneOnOne: false,
                          })
                        }
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                </div>
              </div>

              {sortedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No courses found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    We couldn't find any courses matching your search criteria. Try adjusting your filters or search
                    query.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
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

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <CardTitle className="line-clamp-1 mt-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.tutor.avatar || "/placeholder.svg"} alt={course.tutor.name} />
            <AvatarFallback>{course.tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{course.tutor.name}</span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {course.sessions.online && (
            <Badge variant="secondary" className="bg-background">
              Online: ${course.pricing.online}
            </Badge>
          )}
          {course.sessions.group && (
            <Badge variant="secondary" className="bg-background">
              Group: ${course.pricing.group}
            </Badge>
          )}
          {course.sessions.oneOnOne && (
            <Badge variant="secondary" className="bg-background">
              1-on-1: ${course.pricing.oneOnOne}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-3">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {course.students}/{course.maxStudents} students
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" asChild>
          <Link href={`/student/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function Avatar({ className, children }: AvatarProps) {
  return <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
}

function AvatarImage({ src, alt }: AvatarImageProps) {
  return <img className="aspect-square h-full w-full" src={src || "/placeholder.svg"} alt={alt} />
}

function AvatarFallback({ children }: AvatarFallbackProps) {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">{children}</div>
}