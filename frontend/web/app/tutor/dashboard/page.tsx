"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  DollarSign,
  Download,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/tutor-sidebar";

// Types based on your schema
type User = {
  _id: string;
  name: string;
  email: string;
};

type Course = {
  _id: string;
  title: string;
  tutor: User;
  currentEnrollment: number;
  status: "pending" | "approved" | "rejected";
  pricing: {
    online?: { price: number };
    group?: { price: number };
    oneOnOne?: { price: number };
  };
};

type Enrollment = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course: Course;
  enrolledSessionType: "online" | "group" | "oneOnOne";
  currentStatus:
    | "enrolled"
    | "in_progress"
    | "completed"
    | "dropped"
    | "suspended";
  progress: {
    completionPercentage: number;
    timeSpentTotal: number;
    modules: Array<{
      moduleId: string;
      status: "not_started" | "started" | "completed";
      timeSpent: number;
    }>;
  };
  payment: {
    amountPaid: number;
    totalAmount: number;
    status: "pending" | "partial" | "paid" | "refunded" | "failed";
  };
  enrollmentDate: string;
};

type Session = {
  _id: string;
  course: {
    title: string;
  };
  sessionType: "video" | "in-person";
  scheduledDate: string;
  status: "pending" | "approved" | "declined";
};

type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  activeCourses: number;
  upcomingSessions: number;
  totalEarnings: number;
  pendingEarnings: number;
  changeFromLastMonth: {
    students: number;
    courses: number;
    earnings: number;
  };
};

type ChartData = {
  name: string;
  value: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function TutorDashboardPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [earningsData, setEarningsData] = useState<ChartData[]>([]);
  const [sessionTypeDistribution, setSessionTypeDistribution] = useState<
    ChartData[]
  >([]);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch current user (tutor) information

        const tutorId = JSON.parse(localStorage.getItem("user") || "{}").id;

        // Fetch all enrollments with populated course data
        const enrollmentsRes = await fetch(`${baseUrl}/api/enrollment`, {
          headers,
        });
        if (!enrollmentsRes.ok) throw new Error("Failed to fetch enrollments");
        const enrollmentsData = await enrollmentsRes.json();

        // Filter enrollments where the course tutor matches the current user
        const tutorEnrollments = enrollmentsData.filter(
          (e: Enrollment) => e.course?.tutor?._id === tutorId
        );
        setEnrollments(tutorEnrollments);

        // Extract unique course IDs from the filtered enrollments
        const courseIds = [
          ...new Set(tutorEnrollments.map((e: Enrollment) => e.course._id)),
        ];

        // Fetch tutor's courses
        const coursesRes = await fetch(`${baseUrl}/api/course/tutor`, {
          headers,
        });
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // Fetch sessions for these courses
        const sessionsRes = await fetch(
          `${baseUrl}/api/session?courses=${courseIds.join(",")}`,
          { headers }
        );
        if (!sessionsRes.ok) throw new Error("Failed to fetch sessions");
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);

        // Calculate stats
        const activeStudents = tutorEnrollments.filter((e: Enrollment) =>
          ["enrolled", "in_progress"].includes(e.currentStatus)
        ).length;

        const completedStudents = tutorEnrollments.filter(
          (e: Enrollment) => e.currentStatus === "completed"
        ).length;

        const activeCourses = coursesData.filter(
          (c: Course) => c.status === "approved" || c.status === "pending"
        ).length;

        const upcomingSessions = sessionsData.filter(
          (s: Session) => s.status === "approved"
        ).length;

        const totalEarnings = tutorEnrollments.reduce(
          (sum: number, e: Enrollment) => sum + (e.payment?.amountPaid || 0),
          0
        );

        const pendingEarnings = tutorEnrollments.reduce(
          (sum: number, e: Enrollment) =>
            sum +
            (e.payment?.status === "pending" || e.payment?.status === "partial"
              ? (e.payment?.totalAmount || 0) - (e.payment?.amountPaid || 0)
              : 0),
          0
        );

        // Calculate session type distribution
        const sessionTypeCounts = tutorEnrollments.reduce(
          (acc: Record<string, number>, e: Enrollment) => {
            acc[e.enrolledSessionType] = (acc[e.enrolledSessionType] || 0) + 1;
            return acc;
          },
          {}
        );

        const sessionDistribution = Object.entries(sessionTypeCounts).map(
          ([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value as number,
          })
        );

        // Generate time-based data
        const now = new Date();
        let enrollmentTimeData: ChartData[] = [];
        let earningsTimeData: ChartData[] = [];

        if (timeRange === "week") {
          // Last 7 days
          enrollmentTimeData = Array(7)
            .fill(0)
            .map((_, i) => {
              const date = new Date(now);
              date.setDate(date.getDate() - 6 + i);
              const dateStr = date.toLocaleDateString("en-US", {
                weekday: "short",
              });

              const count = tutorEnrollments.filter((e: Enrollment) => {
                const enrollDate = new Date(e.enrollmentDate);
                return enrollDate.toDateString() === date.toDateString();
              }).length;

              return { name: dateStr, value: count };
            });

          earningsTimeData = Array(7)
            .fill(0)
            .map((_, i) => {
              const date = new Date(now);
              date.setDate(date.getDate() - 6 + i);
              const dateStr = date.toLocaleDateString("en-US", {
                weekday: "short",
              });

              const amount = tutorEnrollments
                .filter((e: Enrollment) => {
                  const enrollDate = new Date(e.enrollmentDate);
                  return enrollDate.toDateString() === date.toDateString();
                })
                .reduce(
                  (sum: number, e: Enrollment) =>
                    sum + (e.payment?.amountPaid || 0),
                  0
                );

              return { name: dateStr, value: amount };
            });
        } else if (timeRange === "month") {
          // Last 30 days grouped by week
          const weeks = Math.ceil(30 / 7);
          enrollmentTimeData = Array(weeks)
            .fill(0)
            .map((_, i) => {
              const startDay = i * 7;
              const endDay = Math.min(startDay + 6, 29);

              const startDate = new Date(now);
              startDate.setDate(startDate.getDate() - 29 + startDay);

              const endDate = new Date(now);
              endDate.setDate(endDate.getDate() - 29 + endDay);

              const count = tutorEnrollments.filter((e: Enrollment) => {
                const enrollDate = new Date(e.enrollmentDate);
                return enrollDate >= startDate && enrollDate <= endDate;
              }).length;

              return { name: `Week ${i + 1}`, value: count };
            });

          earningsTimeData = Array(weeks)
            .fill(0)
            .map((_, i) => {
              const startDay = i * 7;
              const endDay = Math.min(startDay + 6, 29);

              const startDate = new Date(now);
              startDate.setDate(startDate.getDate() - 29 + startDay);

              const endDate = new Date(now);
              endDate.setDate(endDate.getDate() - 29 + endDay);

              const amount = tutorEnrollments
                .filter((e: Enrollment) => {
                  const enrollDate = new Date(e.enrollmentDate);
                  return enrollDate >= startDate && enrollDate <= endDate;
                })
                .reduce(
                  (sum: number, e: Enrollment) =>
                    sum + (e.payment?.amountPaid || 0),
                  0
                );

              return { name: `Week ${i + 1}`, value: amount };
            });
        } else {
          // year
          // Last 12 months
          enrollmentTimeData = Array(12)
            .fill(0)
            .map((_, i) => {
              const date = new Date(now);
              date.setMonth(date.getMonth() - 11 + i);
              const monthStr = date.toLocaleDateString("en-US", {
                month: "short",
              });

              const count = tutorEnrollments.filter((e: Enrollment) => {
                const enrollDate = new Date(e.enrollmentDate);
                return (
                  enrollDate.getMonth() === date.getMonth() &&
                  enrollDate.getFullYear() === date.getFullYear()
                );
              }).length;

              return { name: monthStr, value: count };
            });

          earningsTimeData = Array(12)
            .fill(0)
            .map((_, i) => {
              const date = new Date(now);
              date.setMonth(date.getMonth() - 11 + i);
              const monthStr = date.toLocaleDateString("en-US", {
                month: "short",
              });

              const amount = tutorEnrollments
                .filter((e: Enrollment) => {
                  const enrollDate = new Date(e.enrollmentDate);
                  return (
                    enrollDate.getMonth() === date.getMonth() &&
                    enrollDate.getFullYear() === date.getFullYear()
                  );
                })
                .reduce(
                  (sum: number, e: Enrollment) =>
                    sum + (e.payment?.amountPaid || 0),
                  0
                );

              return { name: monthStr, value: amount };
            });
        }

        // Generate performance data based on actual course completion
        const coursePerformance = coursesData.map((course: Course) => {
          const courseEnrollments = tutorEnrollments.filter(
            (e: Enrollment) => e.course._id === course._id
          );

          const avgCompletion =
            courseEnrollments.length > 0
              ? courseEnrollments.reduce(
                  (sum: number, e: Enrollment) =>
                    sum + (e.progress?.completionPercentage || 0),
                  0
                ) / courseEnrollments.length
              : 0;

          const avgTimeSpent =
            courseEnrollments.length > 0
              ? courseEnrollments.reduce(
                  (sum: number, e: Enrollment) =>
                    sum + (e.progress?.timeSpentTotal || 0),
                  0
                ) / courseEnrollments.length
              : 0;

          return {
            name: course.title,
            completion: avgCompletion,
            timeSpent: avgTimeSpent,
          };
        });

        const mockStats: DashboardStats = {
          totalStudents: tutorEnrollments.length,
          activeStudents,
          completedStudents,
          activeCourses,
          upcomingSessions,
          totalEarnings,
          pendingEarnings,
          changeFromLastMonth: {
            students: Math.round(
              (activeStudents / Math.max(1, activeStudents - 14)) * 100 - 100 ||
                0
            ),
            courses: Math.round(
              (activeCourses / Math.max(1, activeCourses - 2)) * 100 - 100 || 0
            ),
            earnings: Math.round(
              (totalEarnings / Math.max(1, totalEarnings * 0.82)) * 100 - 100 ||
                0
            ),
          },
        };
        setStats(mockStats);
        setEnrollmentData(enrollmentTimeData);
        setPerformanceData(
          coursePerformance.map((c: { name: string; completion: number }) => ({
            name: c.name,
            value: c.completion,
          }))
        );
        setEarningsData(earningsTimeData);
        setSessionTypeDistribution(sessionDistribution);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data. Please try again later."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Rest of the component remains the same...
  // utils/currency.ts
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading your data..." : "Welcome back, Tutor"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={timeRange}
                onValueChange={(value: "week" | "month" | "year") =>
                  setTimeRange(value)
                }
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="year">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild disabled={loading}>
                <Link href="/tutor/create-course">
                  <Plus className="mr-2 h-4 w-4" />
                  New Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                Array(4)
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
              ) : stats ? (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Students
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalStudents}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.changeFromLastMonth.students > 0 ? "+" : ""}
                        {stats.changeFromLastMonth.students}% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Students
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.activeStudents}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.completedStudents} completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Courses
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.activeCourses}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {courses.length} total courses
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Earnings
                      </CardTitle>
                      <span>ETB</span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(stats.totalEarnings)} ETB
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stats.pendingEarnings)} ETB pending
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Student Enrollment</CardTitle>
                      <CardDescription>
                        {timeRange === "week"
                          ? "Last 7 days"
                          : timeRange === "month"
                          ? "Last 30 days"
                          : "Last 12 months"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : enrollmentData.length > 0 ? (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={enrollmentData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.2}
                              />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value: number) => [
                                  `${value} students`,
                                  "Enrollments",
                                ]}
                              />
                              <Bar
                                dataKey="value"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Session Type Distribution</CardTitle>
                      <CardDescription>
                        How students are taking your courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : sessionTypeDistribution.length > 0 ? (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={sessionTypeDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {sessionTypeDistribution.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value) => [
                                  `${value} students`,
                                  "Count",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card> */}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Upcoming Sessions</CardTitle>
                      <CardDescription>
                        Your scheduled sessions for the next 7 days
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
                      ) : sessions.length > 0 ? (
                        <div className="space-y-4">
                          {sessions
                            .filter(
                              (s) => new Date(s.scheduledDate) > new Date()
                            )
                            .sort(
                              (a, b) =>
                                new Date(a.scheduledDate).getTime() -
                                new Date(b.scheduledDate).getTime()
                            )
                            .slice(0, 3)
                            .map((session) => (
                              <div
                                key={session._id}
                                className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                              >
                                <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {session.course.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(session.scheduledDate)} •{" "}
                                    {session.sessionType}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/tutor/sessions/${session._id}`}>
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center">
                          <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            No upcoming sessions
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Schedule new sessions to see them here
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/tutor/schedule">View All Sessions</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Course Performance</CardTitle>
                      <CardDescription>
                        Average completion across your courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[250px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : performanceData.length > 0 ? (
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                opacity={0.2}
                              />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value: number) => [
                                  `${value}%`,
                                  "Average Completion",
                                ]}
                              />
                              <Bar
                                dataKey="value"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Engagement</CardTitle>
                    <CardDescription>
                      Track how students are progressing through your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : enrollmentData.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={enrollmentData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.2}
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderRadius: "var(--radius)",
                              }}
                              formatter={(value) => [
                                `${value} students`,
                                "Active Students",
                              ]}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button disabled={loading}>View Detailed Analytics</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>
                      Track your students' progress across all courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between">
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-4 w-[40px]" />
                              </div>
                              <Skeleton className="h-2 w-full" />
                              <Skeleton className="h-3 w-[160px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : enrollments.length > 0 ? (
                      <div className="space-y-4">
                        {enrollments
                          .sort(
                            (a, b) =>
                              b.progress.completionPercentage -
                              a.progress.completionPercentage
                          )
                          .slice(0, 5)
                          .map((enrollment) => (
                            <div
                              key={enrollment._id}
                              className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback>
                                  {enrollment.student?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") ||
                                    enrollment.student?.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium leading-none">
                                    {enrollment.student?.name ||
                                      enrollment.student?.email ||
                                      `Student ${enrollment._id.slice(-4)}`}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {enrollment.progress.completionPercentage}%
                                  </p>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      enrollment.progress.completionPercentage >
                                      80
                                        ? "bg-green-500"
                                        : enrollment.progress
                                            .completionPercentage > 60
                                        ? "bg-primary"
                                        : "bg-yellow-500"
                                    }`}
                                    style={{
                                      width: `${enrollment.progress.completionPercentage}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {enrollment.course.title} •{" "}
                                    {enrollment.enrolledSessionType}
                                  </span>
                                  <span>
                                    {formatTime(
                                      enrollment.progress.timeSpentTotal
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex flex-col items-center justify-center text-center">
                        <Users className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          No students enrolled yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Share your courses to get students
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/tutor/students">View All Students</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Overview</CardTitle>
                    <CardDescription>Your earnings over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : earningsData.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={earningsData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.2}
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderRadius: "var(--radius)",
                              }}
                              formatter={(value: number) => [
                                formatCurrency(value),
                                "Earnings",
                              ]}
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="hsl(var(--primary))"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button disabled={loading}>View Payment History</Button>
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
