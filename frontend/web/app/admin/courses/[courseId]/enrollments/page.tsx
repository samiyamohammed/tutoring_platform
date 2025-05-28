"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Phone,
  Calendar,
  Check,
  X,
  Clock,
  Search,
  Download,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Enrollment {
  _id: string;
  student: Student;
  course: string;
  enrollmentDate: string;
  currentStatus: "pending" | "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  sessionType: "online" | "group" | "oneOnOne";
  progress: {
    completionPercentage: number;
    lastAccessed: string;
  };
}

interface Course {
  _id: string;
  title: string;
  tutor: {
    _id: string;
    name: string;
  };
}

export default function AdminCourseEnrollmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([
    "pending",
    "active",
    "completed",
    "cancelled",
  ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // In your enrollments/page.tsx
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        // 1. First check if course exists
        const courseResponse = await fetch(
          `${baseUrl}/api/course/${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (courseResponse.status === 404) {
          toast.error("Course not found");
          router.push("/admin/courses");
          return; // Exit early
        }

        if (!courseResponse.ok) {
          const errorData = await courseResponse.json();
          throw new Error(errorData.message || "Failed to fetch course");
        }

        const courseData = await courseResponse.json();
        setCourse(courseData);

        // 2. Then fetch enrollments
        const enrollmentsResponse = await fetch(
          `${baseUrl}/api/enrollment/currentenrollment/${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!enrollmentsResponse.ok) {
          const errorData = await enrollmentsResponse.json().catch(() => ({}));
          console.error("Enrollment fetch error details:", errorData);
          throw new Error(errorData.message || "Failed to fetch enrollments");
        }

        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch data");
        // Redirect to courses list or handle appropriately
        router.push("/admin/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, router, toast]);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      enrollment.student.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter.includes(enrollment.currentStatus);

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    enrollmentId: string,
    newStatus: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const updatedEnrollment = await response.json();

      setEnrollments(
        enrollments.map((e) =>
          e._id === enrollmentId
            ? { ...e, currentStatus: updatedEnrollment.currentStatus }
            : e
        )
      );

      toast.success(`Enrollment status changed to ${newStatus}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/courses">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Course Enrollments</h1>
                  <p className="text-sm text-muted-foreground">
                    Loading enrollment data...
                  </p>
                </div>
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

  if (!course) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/courses">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Course Enrollments</h1>
                  <p className="text-sm text-muted-foreground">
                    Course not found
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Course Not Found</AlertTitle>
                <AlertDescription>
                  The course you're looking for could not be found.
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/courses">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Course Enrollments</h1>
                <p className="text-sm text-muted-foreground">
                  {course.title} - Tutor: {course.tutor.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/courses/${course._id}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Course
                </Link>
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="flex-1 p-8 pt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students</CardTitle>
                  <CardDescription>
                    {enrollments.length} total enrollments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Status Filter <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            setStatusFilter([
                              "pending",
                              "active",
                              "completed",
                              "cancelled",
                            ])
                          }
                        >
                          All Statuses
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setStatusFilter(["active"])}
                        >
                          Active Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setStatusFilter(["pending"])}
                        >
                          Pending Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setStatusFilter(["completed"])}
                        >
                          Completed Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => setStatusFilter(["cancelled"])}
                        >
                          Cancelled Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEnrollments.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No enrollments found matching your criteria
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEnrollments.map((enrollment) => (
                            <TableRow key={enrollment._id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={enrollment.student.avatar}
                                      alt={enrollment.student.name}
                                    />
                                    <AvatarFallback>
                                      {enrollment.student.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {enrollment.student.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {enrollment.sessionType}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {enrollment.student.email}
                                  </div>
                                  {enrollment.student.phone && (
                                    <div className="flex items-center text-sm">
                                      <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                                      {enrollment.student.phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                  {new Date(
                                    enrollment.enrollmentDate
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    enrollment.currentStatus === "active"
                                      ? "default"
                                      : enrollment.currentStatus === "completed"
                                      ? "secondary"
                                      : enrollment.currentStatus === "pending"
                                      ? "outline"
                                      : "destructive"
                                  }
                                >
                                  {enrollment.currentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    enrollment.paymentStatus === "paid"
                                      ? "default"
                                      : enrollment.paymentStatus === "pending"
                                      ? "outline"
                                      : "destructive"
                                  }
                                >
                                  {enrollment.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-20">
                                    <Progress
                                      value={
                                        enrollment.progress.completionPercentage
                                      }
                                      className="h-2"
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {enrollment.progress.completionPercentage}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      Actions
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        handleUpdateStatus(
                                          enrollment._id,
                                          "active"
                                        )
                                      }
                                      disabled={
                                        enrollment.currentStatus === "active"
                                      }
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        handleUpdateStatus(
                                          enrollment._id,
                                          "completed"
                                        )
                                      }
                                      disabled={
                                        enrollment.currentStatus === "completed"
                                      }
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        handleUpdateStatus(
                                          enrollment._id,
                                          "cancelled"
                                        )
                                      }
                                      disabled={
                                        enrollment.currentStatus === "cancelled"
                                      }
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
