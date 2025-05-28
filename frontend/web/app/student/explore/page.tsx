"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Filter, Search, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  ratings?: Array<{
    rating: number;
    comment?: string;
    date: string;
  }>;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  verification_status?: string;
}

interface Pricing {
  online?: {
    price: number;
    maxStudents: number;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  group?: {
    price: number;
    maxStudents: number;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  oneOnOne?: {
    price: number;
    maxStudents: number;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  tutor: Tutor;
  currentEnrollment: number;
  capacity: number;
  rating: number;
  reviews: number;
  image?: string;
  sessionTypes: string[];
  pricing: Pricing;
  prerequisites: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExploreCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"courses" | "tutors">("courses");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sessionTypeFilters, setSessionTypeFilters] = useState({
    online: false,
    group: false,
    oneOnOne: false,
  });
  const [priceRange, setPriceRange] = useState([0, 350]);
  const [sortBy, setSortBy] = useState("popular");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";

        // Fetch courses and filter out inactive ones
        const coursesResponse = await fetch(`${baseUrl}/api/course`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!coursesResponse.ok) throw new Error("Failed to fetch courses");

        const coursesData = await coursesResponse.json();
        setCourses(
          coursesData.filter((course: Course) => course.status !== "inactive")
        );

        // Fetch tutors
        const tutorsResponse = await fetch(`${baseUrl}/api/users/tutors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!tutorsResponse.ok) throw new Error("Failed to fetch tutors");

        const tutorsData = await tutorsResponse.json();
        setTutors(tutorsData);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate average rating for tutor
  const getTutorRating = (tutor: Tutor) => {
    if (!tutor.ratings || tutor.ratings.length === 0) return 0;
    const sum = tutor.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / tutor.ratings.length;
  };

  // Filter courses based on search query and filters
  // Update the filtering logic in the filteredCourses function
  const filteredCourses = courses.filter((course) => {
    // Skip if tutor is null/undefined
    if (!course.tutor) return false;

    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.prerequisites.some((prereq) =>
        prereq.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      course.tutor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesExperience =
      (course.tutor.experience ?? 0) >= experienceFilter;
    const matchesVerification =
      !verifiedOnly || course.tutor.verification_status === "approved";

    const matchesSessionType =
      (!sessionTypeFilters.online &&
        !sessionTypeFilters.group &&
        !sessionTypeFilters.oneOnOne) ||
      (sessionTypeFilters.online && course.sessionTypes.includes("online")) ||
      (sessionTypeFilters.group && course.sessionTypes.includes("group")) ||
      (sessionTypeFilters.oneOnOne && course.sessionTypes.includes("oneOnOne"));

    const prices = [
      course.pricing.online?.price || 0,
      course.pricing.group?.price || 0,
      course.pricing.oneOnOne?.price || 0,
    ].filter((price) => price > 0);

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const matchesPrice =
      (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
      (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLevel &&
      matchesSessionType &&
      matchesPrice &&
      matchesExperience &&
      matchesVerification
    );
  });

  // Filter tutors based on search query and filters
  const filteredTutors = tutors.filter((tutor) => {
    if (!tutor) return false; // Additional safety check

    const matchesSearch =
      searchQuery === "" ||
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.qualification &&
        tutor.qualification
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (tutor.subjects &&
        tutor.subjects.some((subject) =>
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesExperience = (tutor.experience ?? 0) >= experienceFilter;
    const matchesVerification =
      !verifiedOnly || tutor.verification_status === "approved";

    return matchesSearch && matchesExperience && matchesVerification;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const getMinPrice = (course: Course) => {
      const prices = [
        course.pricing.online?.price || Infinity,
        course.pricing.group?.price || Infinity,
        course.pricing.oneOnOne?.price || Infinity,
      ];
      return Math.min(...prices);
    };

    switch (sortBy) {
      case "popular":
        return b.currentEnrollment - a.currentEnrollment;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "priceAsc":
        return getMinPrice(a) - getMinPrice(b);
      case "priceDesc":
        return getMinPrice(b) - getMinPrice(a);
      default:
        return 0;
    }
  });

  // Sort tutors
  const sortedTutors = [...filteredTutors].sort((a, b) => {
    const aRating = getTutorRating(a);
    const bRating = getTutorRating(b);

    switch (sortBy) {
      case "rating":
        return bRating - aRating;
      case "experience":
        return (b.experience || 0) - (a.experience || 0);
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setCategoryFilter("all");
    setLevelFilter("all");
    setExperienceFilter(0);
    setVerifiedOnly(false);
    setSessionTypeFilters({
      online: false,
      group: false,
      oneOnOne: false,
    });
    setPriceRange([0, 350]);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">Explore Courses</h1>
                <p className="text-sm text-muted-foreground">
                  Discover courses from top tutors
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">
                Explore {searchType === "courses" ? "Courses" : "Tutors"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {searchType === "courses"
                  ? "Discover courses from top tutors"
                  : "Find qualified tutors"}
              </p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${
                      searchType === "courses" ? "courses" : "tutors"
                    }...`}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={searchType}
                    onValueChange={(value: "courses" | "tutors") =>
                      setSearchType(value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="courses">Courses</SelectItem>
                      <SelectItem value="tutors">Tutors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchType === "courses" ? (
                        <>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="priceAsc">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="priceDesc">
                            Price: High to Low
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="experience">
                            Most Experienced
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[300px] sm:w-[400px] flex flex-col">
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle>
                      Filter {searchType === "courses" ? "Courses" : "Tutors"}
                    </SheetTitle>
                    <SheetDescription>
                      Narrow down{" "}
                      {searchType === "courses" ? "courses" : "tutors"} based on
                      your preferences
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    {" "}
                    {searchType === "courses" && (
                      <>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Category</h3>
                          <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              {Array.from(
                                new Set(
                                  courses.map((course) => course.category)
                                )
                              ).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Level</h3>
                          <Select
                            value={levelFilter}
                            onValueChange={setLevelFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              {Array.from(
                                new Set(courses.map((course) => course.level))
                              ).map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Minimum Experience
                      </h3>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[0]}
                          max={20}
                          step={1}
                          value={[experienceFilter]}
                          onValueChange={([value]) =>
                            setExperienceFilter(value || 0)
                          }
                        />
                        <span className="text-sm w-12">
                          {experienceFilter}+ years
                        </span>
                      </div>
                    </div>
                    {searchType === "courses" && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Session Type</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="online"
                              checked={sessionTypeFilters.online}
                              onCheckedChange={(checked) =>
                                setSessionTypeFilters({
                                  ...sessionTypeFilters,
                                  online: !!checked,
                                })
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
                                setSessionTypeFilters({
                                  ...sessionTypeFilters,
                                  group: !!checked,
                                })
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
                                setSessionTypeFilters({
                                  ...sessionTypeFilters,
                                  oneOnOne: !!checked,
                                })
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
                    )}
                    {searchType === "courses" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Price Range</h3>
                          <span className="text-sm text-muted-foreground">
                            ETB {priceRange[0]} - ETB {priceRange[1]}
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
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={verifiedOnly}
                        onCheckedChange={(checked) =>
                          setVerifiedOnly(!!checked)
                        }
                      />
                      <label
                        htmlFor="verified"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Verified Tutors Only
                      </label>
                    </div>
                  </div>

                  <SheetFooter className="flex-shrink-0 pt-4 border-t">
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
                  {searchType === "courses"
                    ? `${filteredCourses.length} ${
                        filteredCourses.length === 1 ? "Course" : "Courses"
                      } Found`
                    : `${filteredTutors.length} ${
                        filteredTutors.length === 1 ? "Tutor" : "Tutors"
                      } Found`}
                </h2>
                <div className="flex items-center gap-2">
                  {categoryFilter !== "all" && searchType === "courses" && (
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
                  {levelFilter !== "all" && searchType === "courses" && (
                    <Badge variant="secondary" className="gap-1">
                      {levelFilter}
                      <button
                        onClick={() => setLevelFilter("all")}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}

                  {experienceFilter > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {experienceFilter}+ yrs
                      <button
                        onClick={() => setExperienceFilter(0)}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                  {verifiedOnly && (
                    <Badge variant="secondary" className="gap-1">
                      Verified
                      <button
                        onClick={() => setVerifiedOnly(false)}
                        className="ml-1 rounded-full hover:bg-secondary/80"
                      >
                        ✕
                      </button>
                    </Badge>
                  )}
                  {searchType === "courses" &&
                    (sessionTypeFilters.online ||
                      sessionTypeFilters.group ||
                      sessionTypeFilters.oneOnOne) && (
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

              {searchType === "courses" ? (
                sortedCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No courses found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      We couldn't find any courses matching your search
                      criteria. Try adjusting your filters or search query.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedCourses.map((course) => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>
                )
              ) : sortedTutors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No tutors found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    We couldn't find any tutors matching your search criteria.
                    Try adjusting your filters or search query.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedTutors.map((tutor) => (
                    <TutorCard key={tutor._id} tutor={tutor} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function CourseCard({ course }: { course: Course }) {
  if (!course.tutor) return null;

  const hasOnline = course.sessionTypes.includes("online");
  const hasGroup = course.sessionTypes.includes("group");
  const hasOneOnOne = course.sessionTypes.includes("oneOnOne");

  // Calculate tutor's average rating with null check
  const tutorRating =
    (course.tutor.ratings?.length ?? 0) > 0
      ? course.tutor.ratings!.reduce((acc, curr) => acc + curr.rating, 0) /
        (course.tutor.ratings?.length ?? 1)
      : 0;

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
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={course.tutor?.avatar || "/placeholder.svg"}
              alt={course.tutor?.name || "Tutor"}
            />
            <AvatarFallback>
              {course.tutor?.name?.charAt(0) || "T"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{course.tutor?.name || "Tutor Name"}</span>
          {course.tutor.verification_status === "approved" && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Verified
            </Badge>
          )}
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium ml-1">
              {tutorRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({course.tutor.ratings?.length || 0})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {hasOnline && course.pricing.online && (
            <Badge variant="secondary" className="bg-background">
              Online: ETB {course.pricing.online.price}
            </Badge>
          )}
          {hasGroup && course.pricing.group && (
            <Badge variant="secondary" className="bg-background">
              Group: ETB {course.pricing.group.price}
            </Badge>
          )}
          {hasOneOnOne && course.pricing.oneOnOne && (
            <Badge variant="secondary" className="bg-background">
              1-on-1: ETB {course.pricing.oneOnOne.price}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-3">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {course.currentEnrollment}/{course.capacity} students
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" asChild>
          <Link href={`/student/explore/course-details/${course._id}`}>
            View Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  if (!tutor) return null;

  // Calculate average rating with null check
  const avgRating =
    (tutor.ratings?.length ?? 0) > 0
      ? tutor.ratings!.reduce((acc, curr) => acc + curr.rating, 0) /
        (tutor.ratings?.length ?? 1)
      : 0;

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-transform hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={tutor.avatar || "/placeholder.svg"}
          alt={tutor.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {tutor.verification_status === "approved" && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg line-clamp-1">{tutor.name}</CardTitle>
            {tutor.qualification && (
              <CardDescription className="line-clamp-1 mt-1">
                {tutor.qualification}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center bg-secondary/50 rounded-full px-2 py-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium ml-1">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({tutor.ratings?.length || 0})
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-muted-foreground"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-muted-foreground">
              {tutor.experience
                ? `${tutor.experience}+ years experience`
                : "Experience not specified"}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-muted-foreground"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.5 1.5 0 00-.82 1.296v.224a6.455 6.455 0 00-4.5 1.416 6.458 6.458 0 01-1.153-1.153A60.85 60.85 0 017.5 12.367v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951v.227a60.88 60.88 0 00-5.136 1.86 1.5 1.5 0 00-.82 1.296v1.734a1.75 1.75 0 01-1.75 1.75h-.166a1.75 1.75 0 01-1.75-1.75v-.99c0-.681.405-1.362 1.036-1.653a58.222 58.222 0 013.457-1.482l.2-.067a.75.75 0 01.484 1.425l-.2.067a56.75 56.75 0 00-3.368 1.482.25.25 0 00-.136.227v.99a.25.25 0 00.25.25h.166a.25.25 0 00.25-.25v-1.734a2.5 2.5 0 011.367-2.246A59.43 59.43 0 0112 13.027a59.38 59.38 0 0110.007-2.033.75.75 0 00.242-1.461A60.937 60.937 0 0011.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282.75.75 0 01.242 1.461 46.951 46.951 0 00-7.508 3.03.75.75 0 11-.4-1.209z" />
                <path d="M4.281 10.26a48.442 48.442 0 018.302-3.534.75.75 0 01.402 1.42 46.94 46.94 0 00-7.904 3.34.75.75 0 01-.8-1.226z" />
              </svg>
              <span className="text-sm font-medium">Subjects</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects?.slice(0, 4).map((subject) => (
                <Badge
                  key={subject}
                  variant="outline"
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary"
                >
                  {subject}
                </Badge>
              ))}
              {(tutor.subjects?.length ?? 0) > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary"
                >
                  +{(tutor.subjects?.length ?? 0) - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" asChild>
          <Link
            href={`/student/tutor/${tutor._id}`}
            className="hover:bg-primary/90 transition-colors"
          >
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Avatar({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      className="aspect-square h-full w-full"
      src={src || "/placeholder.svg"}
      alt={alt}
    />
  );
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
      {children}
    </div>
  );
}
