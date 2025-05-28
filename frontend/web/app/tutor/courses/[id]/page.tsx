"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Settings,
  Star,
  Users,
  Video,
  BookOpen,
  Trash2,
  ListChecks,
  FileQuestion,
  DollarSign,
  PieChart,
  Activity,
  Bookmark,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};

type Course = {
  _id: string;
  title: string;
  description: string;
  tutor: User;
  currentEnrollment: number;
  capacity: number;
  status: "pending" | "approved" | "rejected";
  pricing: {
    online?: { price: number };
    group?: { price: number };
    oneOnOne?: { price: number };
  };
  modules: Module[];
  createdAt: string;
  category: string;
  level: string;
};

type Module = {
  _id: string;
  title: string;
  duration: number;
  order: number;
};

type Enrollment = {
  _id: string;
  student: User;
  enrolledSessionType: "online" | "group" | "oneOnOne";
  currentStatus:
    | "enrolled"
    | "in_progress"
    | "completed"
    | "dropped"
    | "suspended";
  progress: {
    completionPercentage: number;
    modules: Array<{
      moduleId: string;
      status: "not_started" | "started" | "completed";
    }>;
  };
  payment: {
    amountPaid: number;
    totalAmount: number;
    status: "pending" | "partial" | "paid" | "refunded" | "failed";
  };
  enrollmentDate: string;
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";

        // Construct headers object
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [courseRes, enrollmentsRes] = await Promise.all([
          fetch(`${baseUrl}/api/course/${courseId}`, { headers }),
          fetch(`${baseUrl}/api/enrollment/course/${courseId}`, {
            headers,
          }),
        ]);

        if (!courseRes.ok)
          throw new Error(`Course fetch failed: ${courseRes.status}`);
        if (!enrollmentsRes.ok) {
          const errorData = await enrollmentsRes.json().catch(() => ({}));
          throw new Error(
            `Enrollments fetch failed: ${enrollmentsRes.status} - ${
              errorData.message || "Unknown error"
            }`
          );
        }

        const courseData = await courseRes.json();
        const enrollmentsData = await enrollmentsRes.json();

        setCourse(courseData);
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, toast]);

  // Calculate statistics
  const calculateStats = () => {
    if (!course || enrollments.length === 0) return null;

    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter((e) =>
      ["enrolled", "in_progress"].includes(e.currentStatus)
    ).length;
    const completedStudents = enrollments.filter(
      (e) => e.currentStatus === "completed"
    ).length;

    const completionRate = Math.round(
      (completedStudents / totalStudents) * 100
    );
    const averageProgress = Math.round(
      enrollments.reduce((sum, e) => sum + e.progress.completionPercentage, 0) /
        totalStudents
    );

    const revenue = enrollments.reduce(
      (sum, e) => sum + e.payment.amountPaid,
      0
    );
    const potentialRevenue = enrollments.reduce(
      (sum, e) => sum + e.payment.totalAmount,
      0
    );

    const moduleCompletion = course.modules.map((module) => {
      const completedCount = enrollments.reduce((count, e) => {
        const moduleProgress = e.progress.modules.find(
          (m) => m.moduleId === module._id
        );
        return count + (moduleProgress?.status === "completed" ? 1 : 0);
      }, 0);
      return {
        moduleId: module._id,
        title: module.title,
        completionRate: Math.round((completedCount / totalStudents) * 100),
      };
    });

    const enrollmentTypes = {
      online: enrollments.filter((e) => e.enrolledSessionType === "online")
        .length,
      group: enrollments.filter((e) => e.enrolledSessionType === "group")
        .length,
      oneOnOne: enrollments.filter((e) => e.enrolledSessionType === "oneOnOne")
        .length,
    };

    return {
      totalStudents,
      activeStudents,
      completedStudents,
      completionRate,
      averageProgress,
      revenue,
      potentialRevenue,
      moduleCompletion,
      enrollmentTypes,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/tutor/courses"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Courses
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Loading...</span>
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

  if (!course) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/tutor/courses"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Courses
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Course Not Found</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium">Course not found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The course you're looking for doesn't exist or you don't have
                  access to it
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/tutor/courses">Back to Courses</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Link
                href="/tutor/courses"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Courses
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tutor/courses/${course._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Play className="mr-2 h-4 w-4" />
                    Preview Course
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Course Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-full lg:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.description}
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge
                        variant={
                          course.status === "approved"
                            ? "default"
                            : course.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {course.status.charAt(0).toUpperCase() +
                          course.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>
                        {course.currentEnrollment}/{course.capacity} students
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>
                        Created{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <img
                        src={getImageByCategory(course.category)}
                        width={550}
                        height={550}
                        alt={`${course.category} image`}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Students</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {stats?.totalStudents || 0}
                      </div>
                    </div>
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completion</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {stats?.completionRate || 0}%
                      </div>
                    </div>
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Progress</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {stats?.averageProgress || 0}%
                      </div>
                    </div>
                    <div className="space-y-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenue</span>
                      </div>
                      <div className="text-2xl font-bold">
                        ${stats?.revenue?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Enrollment Types</div>
                    <div className="flex flex-wrap gap-2">
                      {course.pricing?.online && (
                        <Badge variant="outline" className="bg-background">
                          Online: {stats?.enrollmentTypes.online || 0}
                        </Badge>
                      )}
                      {course.pricing?.group && (
                        <Badge variant="outline" className="bg-background">
                          Group: {stats?.enrollmentTypes.group || 0}
                        </Badge>
                      )}
                      {course.pricing?.oneOnOne && (
                        <Badge variant="outline" className="bg-background">
                          1-on-1: {stats?.enrollmentTypes.oneOnOne || 0}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                      <CardTitle>Course Progress</CardTitle>
                      <CardDescription>
                        Module completion by students
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.modules.length > 0 && stats ? (
                        <div className="space-y-4">
                          {stats.moduleCompletion.map((module) => (
                            <div key={module.moduleId} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="truncate">{module.title}</span>
                                <span className="font-medium">
                                  {module.completionRate}%
                                </span>
                              </div>
                              <Progress
                                value={module.completionRate}
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">
                            No modules yet
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add modules to your course
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Student Status</CardTitle>
                      <CardDescription>
                        Distribution of student progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bookmark className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Enrolled</span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.activeStudents} (
                              {Math.round(
                                (stats.activeStudents / stats.totalStudents) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={
                              (stats.activeStudents / stats.totalStudents) * 100
                            }
                            className="h-2 bg-blue-100"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Completed</span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.completedStudents} ({stats.completionRate}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={stats.completionRate}
                            className="h-2 bg-green-100"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">In Progress</span>
                            </div>
                            <span className="text-sm font-medium">
                              {stats.totalStudents -
                                stats.completedStudents -
                                stats.activeStudents}{" "}
                              (
                              {Math.round(
                                ((stats.totalStudents -
                                  stats.completedStudents -
                                  stats.activeStudents) /
                                  stats.totalStudents) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                          <Progress
                            value={
                              ((stats.totalStudents -
                                stats.completedStudents -
                                stats.activeStudents) /
                                stats.totalStudents) *
                              100
                            }
                            className="h-2 bg-yellow-100"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Users className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">
                            No students yet
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Students will appear when they enroll
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Enrolled Students</CardTitle>
                      <CardDescription>
                        {stats?.totalStudents || 0} students enrolled (
                        {course.capacity - (stats?.totalStudents || 0)} spots
                        remaining)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {enrollments.length > 0 ? (
                      <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                          <div
                            key={enrollment._id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    enrollment.student.avatar ||
                                    "/placeholder.svg"
                                  }
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
                                <div className="text-sm text-muted-foreground">
                                  {enrollment.student.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge
                                variant={
                                  enrollment.enrolledSessionType === "oneOnOne"
                                    ? "default"
                                    : enrollment.enrolledSessionType === "group"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {enrollment.enrolledSessionType === "oneOnOne"
                                  ? "1-on-1"
                                  : enrollment.enrolledSessionType === "group"
                                  ? "Group"
                                  : "Online"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <span>Progress:</span>
                                <span className="font-medium">
                                  {enrollment.progress.completionPercentage}%
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Enrolled:{" "}
                                {new Date(
                                  enrollment.enrollmentDate
                                ).toLocaleDateString()}
                              </div>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          No students enrolled
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Students will appear here when they enroll
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Course Content</CardTitle>
                      <CardDescription>
                        {course.modules.length} modules in this course
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href={`/tutor/courses/${courseId}/modules`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Manage Modules
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {course.modules.length > 0 ? (
                      <div className="space-y-4">
                        {course.modules.map((module) => (
                          <div
                            key={module._id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="flex items-center justify-between p-4 bg-muted/50">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border">
                                  <span className="font-medium">
                                    {module.order}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {module.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Duration: {module.duration} minutes
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No modules yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create your first module in the management page
                        </p>
                        <Button className="mt-4" asChild>
                          <Link href={`/tutor/courses/${courseId}/modules`}>
                            Go to Modules
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>Course Analytics</CardTitle>
                      <CardDescription>
                        Key metrics for your course
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Total Students</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {stats?.totalStudents || 0}
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completion Rate</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {stats?.completionRate || 0}%
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            <span>Avg. Progress</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {stats?.averageProgress || 0}%
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Revenue</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            ${stats?.revenue?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-full md:col-span-1">
                    <CardHeader>
                      <CardTitle>Enrollment Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <PieChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <div className="mt-4 space-y-2">
                        {course.pricing?.online && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              <span>Online</span>
                            </span>
                            <span className="font-medium">
                              {stats?.enrollmentTypes.online || 0} (
                              {Math.round(
                                ((stats?.enrollmentTypes.online || 0) /
                                  (stats?.totalStudents || 1)) *
                                  100
                              )}
                              % )
                            </span>
                          </div>
                        )}
                        {course.pricing?.group && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              <span>Group</span>
                            </span>
                            <span className="font-medium">
                              {stats?.enrollmentTypes.group || 0} (
                              {Math.round(
                                ((stats?.enrollmentTypes.group || 0) /
                                  (stats?.totalStudents || 1)) *
                                  100
                              )}
                              % )
                            </span>
                          </div>
                        )}
                        {course.pricing?.oneOnOne && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                              <span>1-on-1</span>
                            </span>
                            <span className="font-medium">
                              {stats?.enrollmentTypes.oneOnOne || 0} (
                              {Math.round(
                                ((stats?.enrollmentTypes.oneOnOne || 0) /
                                  (stats?.totalStudents || 1)) *
                                  100
                              )}
                              % )
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-full md:col-span-2">
                    <CardHeader>
                      <CardTitle>Progress Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <LineChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
