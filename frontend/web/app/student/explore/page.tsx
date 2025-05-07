"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Filter, Search, Star, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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

interface Tutor {
  _id: string
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
  sessionTypes: string[]
  pricing: Pricing
  prerequisites: string[]
  status: string
  createdAt: string
  updatedAt: string
  currentEnrollment: number
  capacity: number
  waitingListCapacity: number
  waitingList: string[]
  image?: string
  rating: number
  reviews: number
  deadline?: string
}

export default function ExploreCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
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
  const { toast } = useToast()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        const response = await fetch(`${apiUrl}/api/course`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Failed to fetch courses')

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
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.prerequisites.some((prereq) => prereq.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesLevel = levelFilter === "all" || course.level === levelFilter

    const matchesSessionType =
      (!sessionTypeFilters.online && !sessionTypeFilters.group && !sessionTypeFilters.oneOnOne) ||
      (sessionTypeFilters.online && course.sessionTypes.includes('online')) ||
      (sessionTypeFilters.group && course.sessionTypes.includes('group')) ||
      (sessionTypeFilters.oneOnOne && course.sessionTypes.includes('oneOnOne'))

    const prices = [
      course.pricing.online?.price || 0,
      course.pricing.group?.price || 0,
      course.pricing.oneOnOne?.price || 0
    ].filter(price => price > 0)

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    const matchesPrice =
      (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
      (maxPrice >= priceRange[0] && maxPrice <= priceRange[1])

    return matchesSearch && matchesCategory && matchesLevel && matchesSessionType && matchesPrice
  })

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const getMinPrice = (course: Course) => {
      const prices = [
        course.pricing.online?.price || Infinity,
        course.pricing.group?.price || Infinity,
        course.pricing.oneOnOne?.price || Infinity
      ]
      return Math.min(...prices)
    }

    switch (sortBy) {
      case "popular":
        return b.currentEnrollment - a.currentEnrollment
      case "rating":
        return b.rating - a.rating
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "priceAsc":
        return getMinPrice(a) - getMinPrice(b)
      case "priceDesc":
        return getMinPrice(b) - getMinPrice(a)
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

  if (loading) {
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
            <div className="flex-1 flex items-center justify-center">
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
                          {Array.from(new Set(courses.map(course => course.category))).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
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
                          {Array.from(new Set(courses.map(course => course.level))).map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
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
                    <CourseCard key={course._id} course={course} />
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

function CourseCard({ course }: { course: Course }) {
  const hasOnline = course.sessionTypes.includes('online')
  const hasGroup = course.sessionTypes.includes('group')
  const hasOneOnOne = course.sessionTypes.includes('oneOnOne')

  // Calculate total capacity based on session types
  const totalCapacity = [
    hasOnline ? course.pricing.online?.maxStudents || 0 : 0,
    hasGroup ? course.pricing.group?.maxStudents || 0 : 0,
    hasOneOnOne ? course.pricing.oneOnOne?.maxStudents || 0 : 0
  ].reduce((sum, capacity) => sum + capacity, 0)

  // Calculate available seats
  const availableSeats = totalCapacity - course.currentEnrollment
  const isFull = availableSeats <= 0

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
            <AvatarImage src={course.tutor?.avatar || "/placeholder.svg"} alt={course.tutor?.name || "Tutor"} />
            <AvatarFallback>{course.tutor?.name?.charAt(0) || "T"}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{course.tutor?.name || "Tutor Name"}</span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
          </div>
        </div>
        
        {/* Session types and pricing */}
        <div className="flex flex-wrap gap-2 mt-3">
          {hasOnline && course.pricing.online && (
            <Badge variant="secondary" className="bg-background">
              Online: ${course.pricing.online.price} (max {course.pricing.online.maxStudents})
            </Badge>
          )}
          {hasGroup && course.pricing.group && (
            <Badge variant="secondary" className="bg-background">
              Group: ${course.pricing.group.price} (max {course.pricing.group.maxStudents})
            </Badge>
          )}
          {hasOneOnOne && course.pricing.oneOnOne && (
            <Badge variant="secondary" className="bg-background">
              1-on-1: ${course.pricing.oneOnOne.price}
            </Badge>
          )}
        </div>

        {/* Enrollment status */}
        <div className="flex items-center text-sm text-muted-foreground mt-3">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {course.currentEnrollment}/{totalCapacity} students • 
            <span className={isFull ? "text-destructive ml-1" : "text-success ml-1"}>
              {isFull ? "Full" : `${availableSeats} seats available`}
            </span>
          </span>
        </div>

        {/* Waiting list info if applicable */}
        {course.waitingListCapacity > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {course.waitingList?.length || 0} on waiting list ({course.waitingListCapacity} max)
          </div>
        )}

        {/* Course deadline if set */}
        {course.deadline && (
          <div className="text-xs text-muted-foreground mt-1">
            Enrollment closes: {new Date(course.deadline).toLocaleDateString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" asChild>
          <Link href={`/student/explore/course-details/${course._id}`}>
            {isFull ? 'Join Waiting List' : 'Enroll Now'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function Avatar({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return <img className="aspect-square h-full w-full" src={src || "/placeholder.svg"} alt={alt} />
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">{children}</div>
}