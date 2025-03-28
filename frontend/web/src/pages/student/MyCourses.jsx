"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, BookOpen, Clock, Calendar, MoreHorizontal, Award, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// JSON data for courses
const coursesData = [
  {
    id: 1,
    title: "Advanced Mathematics",
    description: "A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. John Doe",
    status: "In Progress",
    progress: 85,
    modules: 12,
    hours: 42,
    endDate: "Ends Dec 15",
    action: "Continue",
    color: "from-blue-600 to-blue-400",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Introduction to Programming",
    description: "A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. Jane Smith",
    status: "In Progress",
    progress: 62,
    modules: 15,
    hours: 36,
    endDate: "Ends Jan 10",
    action: "Continue",
    color: "from-emerald-600 to-emerald-400",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Physics Fundamentals",
    description: "A deep dive into the wonders of the universe and beyond.",
    instructor: "Dr. Michael Brown",
    status: "In Progress",
    progress: 38,
    modules: 10,
    hours: 30,
    endDate: "Ends Feb 5",
    action: "Continue",
    color: "from-purple-600 to-purple-400",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Web Development Basics",
    description: "A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. Sarah Johnson",
    status: "Completed",
    progress: 100,
    modules: 8,
    hours: 24,
    endDate: "Completed",
    action: "View Certificate",
    color: "from-amber-600 to-amber-400",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const categories = [
  { name: "All Courses", count: 4, value: "all" },
  { name: "In Progress", count: 3, value: "in-progress" },
  { name: "Completed", count: 1, value: "completed" },
  { name: "Archived", count: 0, value: "archived" },
]

const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-48 bg-gradient-to-r ${course.color} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover opacity-30 transition-transform duration-500"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />
        </div>
        <div className="absolute top-4 right-4">
          <Badge
            variant={course.status === "Completed" ? "success" : "warning"}
            className={`
              ${course.status === "Completed" ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"} 
              text-white font-medium px-3 py-1 rounded-full
            `}
          >
            {course.status}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="font-bold text-xl text-white">{course.title}</h3>
          <p className="text-white/80 text-sm">{course.instructor}</p>
        </div>
      </div>

      <CardContent className="p-5">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progress</span>
            <span className="font-bold">{course.progress}%</span>
          </div>
          <Progress
            value={course.progress}
            className="h-2"
            indicatorClassName={course.status === "Completed" ? "bg-green-500" : "bg-amber-500"}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" />
            <span>{course.modules} Modules</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{course.hours} Hours</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{course.endDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0 flex">
        <Button
          asChild
          className={`w-full rounded-none h-12 ${
            course.status === "Completed" ? "bg-green-600 hover:bg-green-700" : "bg-emerald-800 hover:bg-emerald-900"
          } text-white font-medium`}
        >
          <Link to={`/student/course/${course.id}`} className="flex items-center justify-center">
            {course.status === "Completed" ? (
              <>
                <Award className="mr-2 h-4 w-4" />
                {course.action}
              </>
            ) : (
              <>
                {course.action}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 w-12 rounded-none border-l">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Add to favorites</DropdownMenuItem>
            <DropdownMenuItem>Share course</DropdownMenuItem>
            <DropdownMenuItem>Download materials</DropdownMenuItem>
            {course.status !== "Completed" && <DropdownMenuItem>Mark as completed</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

const MyCourses = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredCourses, setFilteredCourses] = useState(coursesData)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const filtered = coursesData.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "in-progress" && course.status === "In Progress") ||
        (activeCategory === "completed" && course.status === "Completed") ||
        (activeCategory === "archived" && course.status === "Archived")

      return matchesSearch && matchesCategory
    })

    setFilteredCourses(filtered)
  }, [searchTerm, activeCategory])

  const handleSearch = (e) => {
    e.preventDefault()
    // Already filtering in real-time, but could add additional logic here
  }

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and track your learning journey</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                isSearchFocused ? "text-emerald-800" : "text-gray-400"
              }`}
            />
            <Input
              type="text"
              placeholder="Search courses..."
              className="pl-10 bg-gray-100 border-gray-200 focus:bg-white focus-visible:ring-emerald-800/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <Button type="submit" className="bg-emerald-800 hover:bg-emerald-700 text-white">
            Search
          </Button>
        </form>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="bg-gray-100 p-1 h-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm py-2"
            >
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter to find what you're looking for.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setActiveCategory("all")
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCourses

