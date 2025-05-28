"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileCheck,
  Users,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// Types for our API responses
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type Course = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type TutorRequest = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  verification_status: string;
  verification_documents: string[];
  qualification: string;
  experience: string;
  subjects: string[];
  rejectionReason?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        await Promise.all([fetchUsers(), fetchCourses(), fetchTutors()]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${baseUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);

      if (errorMessage.includes("Session expired")) {
        toast.error("Session Expired");
        router.push("/login");
      }
    }
  };

  const fetchTutors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${baseUrl}/api/users/tutors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const mappedTutors = data.map((tutor: any) => ({
        _id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        createdAt: tutor.createdAt,
        verification_status: tutor.verification_status,
        verification_documents: tutor.verification_documents || [],
        qualification: tutor.qualification,
        experience: tutor.experience,
        subjects: tutor.subjects,
        rejectionReason: tutor.rejectionReason,
      }));

      setTutorRequests(mappedTutors);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tutors";
      setError(errorMessage);

      if (errorMessage.includes("Session expired")) {
        toast.error("Session Expired");
        router.push("/login");
      }
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${baseUrl}/api/course`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  // Calculate derived statistics
  const totalUsers = users.length;
  const totalCourses = courses.length;
  const pendingTutorRequests = tutorRequests.filter(
    (req) => req.verification_status === "pending"
  ).length;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="w-[400px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading platform data..."
                  : "Platform overview and statistics"}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-[60px] mb-1" />
                        <Skeleton className="h-3 w-[120px]" />
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Courses
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalCourses}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tutor Requests
                      </CardTitle>
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {tutorRequests.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pendingTutorRequests} pending review
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="tutors">Tutor Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Tutor Requests</CardTitle>
                      <CardDescription>
                        Tutors waiting for verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-md mr-4" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-3 w-[150px]" />
                              </div>
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          ))}
                        </div>
                      ) : tutorRequests.length > 0 ? (
                        <div className="space-y-4">
                          {tutorRequests
                            .filter(
                              (req) => req.verification_status === "pending"
                            )
                            .slice(0, 3)
                            .map((request) => (
                              <div
                                key={request._id}
                                className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                              >
                                <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {request.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Applied: {formatDate(request.createdAt)}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/admin/tutor-requests/${request._id}`}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center">
                          <FileCheck className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            No pending tutor requests
                          </p>
                          <p className="text-sm text-muted-foreground">
                            All tutor applications have been processed
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/tutor-requests">
                          View All Requests
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Courses</CardTitle>
                      <CardDescription>Recently added courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-md mr-4" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-3 w-[150px]" />
                              </div>
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          ))}
                        </div>
                      ) : courses.length > 0 ? (
                        <div className="space-y-4">
                          {courses.slice(0, 3).map((course) => (
                            <div
                              key={course._id}
                              className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                            >
                              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {course.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Created: {formatDate(course.createdAt)}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/courses/${course._id}`}>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            No courses found
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/courses">Manage Courses</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      List of all registered users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-3 w-[150px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : users.length > 0 ? (
                      <div className="space-y-4">
                        {users.slice(0, 5).map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center justify-center rounded-full border p-2 mr-4">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email} • {user.role}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/users/${user._id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex flex-col items-center justify-center text-center">
                        <Users className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No users found</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/users">View All Users</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Courses</CardTitle>
                    <CardDescription>
                      List of all platform courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-md mr-4" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-3 w-[150px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : courses.length > 0 ? (
                      <div className="space-y-4">
                        {courses.slice(0, 5).map((course) => (
                          <div
                            key={course._id}
                            className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {course.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Status: {course.status} • Created:{" "}
                                {formatDate(course.createdAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/courses/${course._id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex flex-col items-center justify-center text-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No courses found</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/courses">Manage All Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="tutors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tutor Applications</CardTitle>
                    <CardDescription>
                      List of tutor verification requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-md mr-4" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-3 w-[150px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : tutorRequests.length > 0 ? (
                      <div className="space-y-4">
                        {tutorRequests.slice(0, 5).map((request) => (
                          <div
                            key={request._id}
                            className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {request.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Status: {request.verification_status} • Applied:{" "}
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/tutor-requests/${request._id}`}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex flex-col items-center justify-center text-center">
                        <FileCheck className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          No tutor applications found
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/tutor-requests">
                        View All Applications
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
