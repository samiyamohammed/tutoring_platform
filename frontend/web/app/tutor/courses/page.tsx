"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  AlertCircle,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: "pending" | "approved" | "rejected" | "inactive";
  capacity: number;
  sessionTypes: ("online" | "group" | "oneOnOne")[];
  pricing: {
    online?: { price: number };
    group?: { price: number };
    oneOnOne?: { price: number };
  };
  tutor: string;
}

interface Enrollment {
  _id: string;
  course: {
    _id: string;
  };
  status: string;
}

interface CourseCardProps {
  course: Course;
  enrollmentCount: number;
  onStatusChange: (
    id: string,
    status: "pending" | "approved" | "rejected" | "inactive"
  ) => void;
  onDelete: (id: string) => void;
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[DEBUG] Starting data fetch...");
        const token = localStorage.getItem("token") || "";
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user.id) throw new Error("User not authenticated");

        // First fetch tutor's courses
        const coursesRes = await fetch(`${baseUrl}/api/course/tutor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesRes.json();

        // Then fetch enrollments for each course
        const enrollmentPromises = coursesData.map(async (course: Course) => {
          const res = await fetch(
            `${baseUrl}/api/enrollment/course/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok)
            throw new Error(
              `Failed to fetch enrollments for course ${course._id}`
            );
          return res.json();
        });

        const enrollmentsResults = await Promise.all(enrollmentPromises);
        const allEnrollments = enrollmentsResults.flat();

        // Transform enrollment data to match interface
        const validatedEnrollments = allEnrollments.map((e: any) => ({
          _id: e._id,
          course: {
            _id: e.course?._id, // Match nested course ID structure
          },
          status: e.currentStatus,
        }));

        console.log("[DEBUG] Fetched courses:", coursesData);
        console.log("[DEBUG] Fetched enrollments:", validatedEnrollments);

        setCourses(coursesData);
        setEnrollments(validatedEnrollments);
      } catch (error) {
        console.error("[ERROR] Fetch error:", error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  const getEnrollmentCount = (courseId: string) => {
    const count = enrollments.filter((e) => e.course._id === courseId).length;
    console.log(`[DEBUG] Enrollment count for ${courseId}:`, count);
    return count;
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (
    courseId: string,
    newStatus: "pending" | "approved" | "rejected" | "inactive"
  ) => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${baseUrl}/api/course/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update course status");

      setCourses(
        courses.map((course) =>
          course._id === courseId ? { ...course, status: newStatus } : course
        )
      );

      return true; // Indicate success
    } catch (error) {
      console.error("[ERROR] Status change error:", error);
      throw error; // Re-throw to be caught in CourseCard
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      console.log(`[DEBUG] Attempting to delete course ${courseId}`);
      const token = localStorage.getItem("token") || "";

      const response = await fetch(`${baseUrl}/api/course/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("[DEBUG] Delete response:", data);

      if (!response.ok) {
        const data = await response.json();
        console.error("[ERROR] Delete failed:", data.message);

        if (data.message.includes("enrolled students")) {
          toast.error("Cannot Delete Course", {
            description: data.message,
            action: {
              label: "Deactivate Instead",
              onClick: () => handleStatusChange(courseId, "inactive"),
            },
            duration: 10000, // 10 seconds
            dismissible: true,
          });
          return;
        }

        toast.error("Failed to delete course", {
          description: data.message || "An unknown error occurred",
        });
        throw new Error(data.message || "Failed to delete course");
      }

      console.log("[DEBUG] Updating courses state after deletion");
      setCourses((prev) => {
        const updated = prev.filter((course) => course._id !== courseId);
        console.log("[DEBUG] Updated courses list:", updated);
        return updated;
      });

      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("[ERROR] Delete error:", error);
      toast.error("Failed to delete course");
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">My Courses</h1>
                <p className="text-sm text-muted-foreground">
                  Loading your courses...
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
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
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">My Courses</h1>
              <p className="text-sm text-muted-foreground">
                Manage your courses and sessions
              </p>
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
                  {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select> */}
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(
                        new Set(courses.map((course) => course.category))
                      ).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                More Filters
              </Button> */}
            </div>

            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No courses found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    categoryFilter !== "all"
                      ? "Try adjusting your filters or search query"
                      : "Create your first course to get started"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    enrollmentCount={getEnrollmentCount(course._id)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function CourseCard({
  course,
  enrollmentCount,
  onStatusChange,
  onDelete,
}: CourseCardProps) {
  const hasOnline = course.sessionTypes.includes("online");
  const hasGroup = course.sessionTypes.includes("group");
  const hasOneOnOne = course.sessionTypes.includes("oneOnOne");

  const handleDelete = async () => {
    if (enrollmentCount > 0) {
      toast.info(
        `There are ${enrollmentCount} enrolled students. Please deactivate instead.`
      );
      return;
    }

    try {
      await onDelete(course._id);
      toast.error("Course deleted permanently");
    } catch (error) {
      toast.error("Failed to delete course. Please try again.");
    }
  };

  const handleDeactivate = async () => {
    try {
      const newStatus = course.status === "inactive" ? "approved" : "inactive";

      // Call the parent component's status change handler
      await onStatusChange(course._id, newStatus);

      toast.success(
        `Course ${
          newStatus === "inactive" ? "deactivated" : "reactivated"
        } successfully`
      );
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };
  const categoryImageMap: Record<string, string> = {
    mathematics: "/mathematicss.jpeg",
    science: "/science.jpeg",
    language: "/language.jpeg",
    music: "/music.jpeg",
    marketing: "/marketing.png",
    business: "/business.jpeg",
    design: "/fashion.jpeg",
    programming: "/programing.jpeg",
  };

  function getImageByCategory(category: string): string {
    // Convert to lowercase for case-insensitive matching
    const lowerCategory = category.toLowerCase();
    return categoryImageMap[lowerCategory] || "/defaultt.jpeg";
  }
  return (
    <Card className="overflow-hidden">
      {/* Card Image */}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={getImageByCategory(course.category)}
          width={550}
          height={550}
          alt={`${course.category} image`}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
        />
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1 text-lg">{course.title}</CardTitle>
          {/* Dropdown Menu */}
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

              {/* Toggle Deactivate/Reactivate */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleDeactivate();
                }}
                className={
                  course.status === "inactive"
                    ? "text-green-600 focus:bg-green-50"
                    : "text-yellow-600 focus:bg-yellow-50"
                }
              >
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>
                      {course.status === "inactive"
                        ? "Reactivate Course"
                        : "Deactivate Course"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {enrollmentCount > 0
                        ? `${enrollmentCount} active enrollments`
                        : course.status === "inactive"
                        ? "Will be visible to students"
                        : "Will be hidden from students"}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>

              {/* Delete Option */}
              <DropdownMenuItem
                className={
                  enrollmentCount > 0
                    ? "text-red-400 focus:bg-red-50"
                    : "text-red-600 focus:bg-red-50"
                }
                onClick={handleDelete}
                disabled={enrollmentCount > 0}
              >
                <div className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>
                      {enrollmentCount > 0
                        ? "Delete (Disabled)"
                        : "Delete Course"}
                    </span>
                    {enrollmentCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Cannot delete with active enrollments
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardDescription className="line-clamp-2 mt-1">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" />
            {course.level}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span className="font-medium">
              {enrollmentCount}/{course.capacity}
            </span>
            {enrollmentCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                Active Students
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {hasOnline && course.pricing.online && (
            <Badge variant="outline" className="bg-background">
              Online: ETB{course.pricing.online.price}
            </Badge>
          )}
          {hasGroup && course.pricing.group && (
            <Badge variant="outline" className="bg-background">
              Group: ETB{course.pricing.group.price}
            </Badge>
          )}
          {hasOneOnOne && course.pricing.oneOnOne && (
            <Badge variant="outline" className="bg-background">
              1-on-1: ETB{course.pricing.oneOnOne.price}
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
  );
}
