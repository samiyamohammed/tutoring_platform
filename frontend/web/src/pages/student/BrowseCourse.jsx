"use client"

import { useState, useEffect } from "react"
import { Filter, BookOpen, Clock, Star, Sparkles, TrendingUp, X } from "lucide-react"
import { AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Sample course data
const courses = [
  {
    id: 1,
    title: "Data Science Fundamentals",
    instructor: "Prof. Alex Thompson",
    modules: 14,
    hours: 36,
    rating: 4.8,
    reviews: 124,
    level: "Beginner",
    category: "Data Science",
    tags: ["Python"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: 2,
    title: "Advanced Algorithms",
    instructor: "Dr. Elena Rodriguez",
    modules: 12,
    hours: 30,
    rating: 4.9,
    reviews: 89,
    level: "Advanced",
    category: "Algorithms",
    tags: ["Computer Science"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-purple-600 to-purple-400",
  },
  {
    id: 3,
    title: "Organic Chemistry",
    instructor: "Prof. David Lee",
    modules: 16,
    hours: 40,
    rating: 4.7,
    reviews: 112,
    level: "Intermediate",
    category: "Chemistry",
    tags: ["Laboratory"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-green-600 to-green-400",
  },
  {
    id: 4,
    title: "Machine Learning Basics",
    instructor: "Prof. James Wilson",
    modules: 10,
    hours: 28,
    rating: 4.6,
    reviews: 205,
    level: "Beginner",
    category: "ML",
    tags: ["AI"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-amber-600 to-amber-400",
  },
  {
    id: 5,
    title: "Calculus II",
    instructor: "Dr. Emily Chen",
    modules: 15,
    hours: 42,
    rating: 4.8,
    reviews: 176,
    level: "Intermediate",
    category: "Mathematics",
    tags: ["Calculus"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-red-600 to-red-400",
  },
  {
    id: 6,
    title: "Quantum Physics",
    instructor: "Prof. Richard Barnes",
    modules: 18,
    hours: 50,
    rating: 4.9,
    reviews: 142,
    level: "Advanced",
    category: "Physics",
    tags: ["Quantum"],
    image: "/placeholder.svg?height=200&width=400",
    color: "from-emerald-600 to-emerald-400",
  },
]

// Filter options
const categories = ["All Categories", "Data Science", "Algorithms", "Chemistry", "ML", "Mathematics", "Physics"]

const levels = ["Beginner", "Intermediate", "Advanced"]

const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-40 bg-gradient-to-r ${course.color} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover opacity-30 transition-transform duration-500"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white/80 font-medium">{course.level}</Badge>
        </div>
        <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="font-bold text-lg text-white line-clamp-1">{course.title}</h3>
          <p className="text-white/80 text-sm">{course.instructor}</p>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-bold">{course.rating}</span>
            <span className="text-gray-500 text-sm ml-1">({course.reviews})</span>
          </div>
          <Badge variant="outline" className="bg-gray-100">
            {course.category}
          </Badge>
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" />
            <span>{course.modules} Modules</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{course.hours} Hours</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {course.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full bg-emerald-800 hover:bg-emerald-700 text-white">Enroll Now</Button>
      </CardFooter>
    </Card>
  )
}

const FilterSidebar = ({
  filters,
  setFilters,
  applyFilters,
  resetFilters,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
}) => {
  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {Object.values(filters).flat().length > 0 && (
            <Badge className="ml-1 bg-emerald-800 text-white">{Object.values(filters).flat().length}</Badge>
          )}
        </Button>

        {Object.values(filters).flat().length > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-80 bg-white p-4 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Filter Content - Same as desktop */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Search</label>
                    <Input
                      placeholder="Search courses..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="bg-gray-100 border-0"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={filters.category || "All Categories"}
                      onValueChange={(value) =>
                        setFilters({ ...filters, category: value === "All Categories" ? "" : value })
                      }
                    >
                      <SelectTrigger className="bg-gray-100 border-0">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Accordion type="multiple" defaultValue={["level", "rating"]}>
                    <AccordionItem value="level" className="border-b-0">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <span className="text-sm font-medium">Level</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {levels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-level-${level}`}
                                checked={filters.levels?.includes(level) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({
                                      ...filters,
                                      levels: [...(filters.levels || []), level],
                                    })
                                  } else {
                                    setFilters({
                                      ...filters,
                                      levels: (filters.levels || []).filter((l) => l !== level),
                                    })
                                  }
                                }}
                              />
                              <label
                                htmlFor={`mobile-level-${level}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {level}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rating" className="border-b-0">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <span className="text-sm font-medium">Rating</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {[4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-rating-${rating}`}
                                checked={filters.minRating === rating}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({ ...filters, minRating: rating })
                                  } else if (filters.minRating === rating) {
                                    setFilters({ ...filters, minRating: undefined })
                                  }
                                }}
                              />
                              <label
                                htmlFor={`mobile-rating-${rating}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                              >
                                {rating}+ <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-1" />
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full bg-emerald-800 hover:bg-emerald-700"
                    onClick={() => {
                      applyFilters()
                      setIsMobileFilterOpen(false)
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      resetFilters()
                      setIsMobileFilterOpen(false)
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block sticky top-4">
        <Card className="shadow-md border-none">
          <CardContent className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-lg mb-4">Filters</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <Input
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="bg-gray-100 border-0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select
                    value={filters.category || "All Categories"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value === "All Categories" ? "" : value })
                    }
                  >
                    <SelectTrigger className="bg-gray-100 border-0">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Accordion type="multiple" defaultValue={["level", "rating"]}>
                  <AccordionItem value="level" className="border-b-0">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="text-sm font-medium">Level</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {levels.map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={filters.levels?.includes(level) || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({
                                    ...filters,
                                    levels: [...(filters.levels || []), level],
                                  })
                                } else {
                                  setFilters({
                                    ...filters,
                                    levels: (filters.levels || []).filter((l) => l !== level),
                                  })
                                }
                              }}
                            />
                            <label
                              htmlFor={`level-${level}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rating" className="border-b-0">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="text-sm font-medium">Rating</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rating-${rating}`}
                              checked={filters.minRating === rating}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({ ...filters, minRating: rating })
                                } else if (filters.minRating === rating) {
                                  setFilters({ ...filters, minRating: undefined })
                                }
                              }}
                            />
                            <label
                              htmlFor={`rating-${rating}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                              {rating}+ <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-1" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full bg-emerald-800 hover:bg-emerald-700" onClick={applyFilters}>
                Apply Filters
              </Button>
              {Object.values(filters).flat().length > 0 && (
                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  Reset Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

const BrowseCourse = () => {
  const [activeTab, setActiveTab] = useState("featured")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    levels: [],
    minRating: undefined,
  })

  const [filteredFeaturedCourses, setFilteredFeaturedCourses] = useState(courses.slice(0, 3))
  const [filteredPopularCourses, setFilteredPopularCourses] = useState(courses.slice(3))

  const applyFilters = () => {
    const filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch =
        !filters.search ||
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))

      // Category filter
      const matchesCategory =
        !filters.category || filters.category === "All Categories" || course.category === filters.category

      // Level filter
      const matchesLevel = !filters.levels?.length || filters.levels.includes(course.level)

      // Rating filter
      const matchesRating = !filters.minRating || course.rating >= filters.minRating

      return matchesSearch && matchesCategory && matchesLevel && matchesRating
    })

    setFilteredFeaturedCourses(filtered.slice(0, Math.min(3, filtered.length)))
    setFilteredPopularCourses(filtered.slice(Math.min(3, filtered.length)))
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      levels: [],
      minRating: undefined,
    })

    setFilteredFeaturedCourses(courses.slice(0, 3))
    setFilteredPopularCourses(courses.slice(3))
  }

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [filters])

  return (
    <section className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground mt-1">Discover new learning opportunities</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-gray-100 p-1 h-auto">
            <TabsTrigger
              value="featured"
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm py-2"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm py-2"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            isMobileFilterOpen={isMobileFilterOpen}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
          />
        </div>

        {/* Courses Section */}
        <div className="lg:col-span-3">
          {/* Applied Filters */}
          {Object.values(filters).flat().length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-500">Applied filters:</span>

              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100">
                  Search: {filters.search}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFilters({ ...filters, search: "" })} />
                </Badge>
              )}

              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100">
                  Category: {filters.category}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFilters({ ...filters, category: "" })} />
                </Badge>
              )}

              {filters.levels?.map((level) => (
                <Badge key={level} variant="secondary" className="flex items-center gap-1 bg-gray-100">
                  Level: {level}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        levels: filters.levels.filter((l) => l !== level),
                      })
                    }
                  />
                </Badge>
              ))}

              {filters.minRating && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100">
                  Rating: {filters.minRating}+ <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setFilters({ ...filters, minRating: undefined })}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-red-500 hover:text-red-700 h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredFeaturedCourses.length === 0 && filteredPopularCourses.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          )}

          {/* Featured Courses */}
          {activeTab === "featured" && filteredFeaturedCourses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                  Featured Courses
                </h2>
                <span className="text-sm text-gray-500">{filteredFeaturedCourses.length} courses</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeaturedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Popular Courses */}
          {activeTab === "popular" && filteredPopularCourses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Popular Courses
                </h2>
                <span className="text-sm text-gray-500">{filteredPopularCourses.length} courses</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPopularCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default BrowseCourse

