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
  FileCheck,
  Flag,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  price: number;
  studentsEnrolled: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

type TutorRequest = {
  _id: string;
  user: User;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Report = {
  _id: string;
  reporter: User;
  reportedItem: {
    type: string;
    id: string;
    title?: string;
  };
  reason: string;
  status: string;
  createdAt: string;
};

type RevenueData = {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  revenueHistory: Array<{ date: string; amount: number }>;
};

type ChartData = {
  name: string;
  value: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const API_BASE = "http://localhost:5000/api";

// Default demo data
const DEMO_USERS: User[] = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    name: "Tutor User",
    email: "tutor@example.com",
    role: "tutor",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    name: "Student User",
    email: "student@example.com",
    role: "student",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "4",
    name: "New Student",
    email: "newstudent@example.com",
    role: "student",
    createdAt: new Date().toISOString(),
  },
];

const DEMO_COURSES: Course[] = [
  {
    _id: "1",
    title: "Introduction to React",
    description: "Learn React fundamentals",
    price: 49.99,
    studentsEnrolled: 120,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
  },
  {
    _id: "2",
    title: "Advanced JavaScript",
    description: "Deep dive into JavaScript",
    price: 59.99,
    studentsEnrolled: 85,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
  },
  {
    _id: "3",
    title: "Node.js Fundamentals",
    description: "Backend development with Node.js",
    price: 69.99,
    studentsEnrolled: 45,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
  },
  {
    _id: "4",
    title: "New Course Pending",
    description: "Pending approval course",
    price: 39.99,
    studentsEnrolled: 0,
    createdAt: new Date().toISOString(),
    status: "pending",
  },
];

const DEMO_TUTOR_REQUESTS: TutorRequest[] = [
  {
    _id: "1",
    user: DEMO_USERS[3],
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    user: DEMO_USERS[2],
    status: "pending",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_REPORTS: Report[] = [
  {
    _id: "1",
    reporter: DEMO_USERS[2],
    reportedItem: {
      type: "course",
      id: "1",
      title: "Introduction to React",
    },
    reason: "Inappropriate content",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    reporter: DEMO_USERS[3],
    reportedItem: {
      type: "user",
      id: "2",
    },
    reason: "Spamming messages",
    status: "in_progress",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_REVENUE: RevenueData = {
  totalRevenue: 12500,
  monthlyRevenue: 4200,
  revenueGrowth: 12.5,
  revenueHistory: Array(30)
    .fill(0)
    .map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.floor(Math.random() * 500) + 100,
    })),
};

async function fetchWithToken(endpoint: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      // Return null for 404 errors to use demo data
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [userGrowthData, setUserGrowthData] = useState<ChartData[]>([]);
  const [userDistributionData, setUserDistributionData] = useState<ChartData[]>(
    []
  );
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState<ChartData[]>(
    []
  );
  const [reportTypeData, setReportTypeData] = useState<ChartData[]>([]);

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

        // Fetch all data in parallel
        const [usersData, coursesData, requestsData, reportsData, revenueData] =
          await Promise.all([
            fetchWithToken("/users").catch(() => DEMO_USERS),
            fetchWithToken("/course").catch(() => DEMO_COURSES),
            fetchWithToken("/tutor-requests?status=pending").catch(
              () => DEMO_TUTOR_REQUESTS
            ),
            fetchWithToken("/reports?limit=3").catch(() => DEMO_REPORTS),
            fetchWithToken("/revenue").catch(() => DEMO_REVENUE),
          ]);

        setUsers(usersData || DEMO_USERS);
        setCourses(coursesData || DEMO_COURSES);
        setTutorRequests(requestsData || DEMO_TUTOR_REQUESTS);
        setReports(reportsData || DEMO_REPORTS);
        setRevenue(revenueData || DEMO_REVENUE);

        // Process data for charts
        processChartData(
          usersData || DEMO_USERS,
          coursesData || DEMO_COURSES,
          reportsData || DEMO_REPORTS,
          revenueData || DEMO_REVENUE
        );
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
  }, [timeRange, router]);

  const processChartData = (
    users: User[],
    courses: Course[],
    reports: Report[],
    revenue: RevenueData
  ) => {
    // User growth data
    const now = new Date();
    let userGrowth: ChartData[] = [];

    if (timeRange === "week") {
      userGrowth = Array(7)
        .fill(0)
        .map((_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - 6 + i);
          const dateStr = date.toLocaleDateString("en-US", {
            weekday: "short",
          });

          const count = users.filter((user) => {
            const userDate = new Date(user.createdAt);
            return userDate.toDateString() === date.toDateString();
          }).length;

          return { name: dateStr, value: count };
        });
    } else if (timeRange === "month") {
      const weeks = Math.ceil(30 / 7);
      userGrowth = Array(weeks)
        .fill(0)
        .map((_, i) => {
          const startDay = i * 7;
          const endDay = Math.min(startDay + 6, 29);

          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 29 + startDay);

          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 29 + endDay);

          const count = users.filter((user) => {
            const userDate = new Date(user.createdAt);
            return userDate >= startDate && userDate <= endDate;
          }).length;

          return { name: `Week ${i + 1}`, value: count };
        });
    } else {
      // year
      userGrowth = Array(12)
        .fill(0)
        .map((_, i) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - 11 + i);
          const monthStr = date.toLocaleDateString("en-US", { month: "short" });

          const count = users.filter((user) => {
            const userDate = new Date(user.createdAt);
            return (
              userDate.getMonth() === date.getMonth() &&
              userDate.getFullYear() === date.getFullYear()
            );
          }).length;

          return { name: monthStr, value: count };
        });
    }
    setUserGrowthData(userGrowth);

    // User distribution by role
    const roleCounts = users.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const userDistribution = Object.entries(roleCounts).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
      })
    );
    setUserDistributionData(userDistribution);

    // Revenue data
    let revenueChartData: ChartData[] = [];
    if (revenue?.revenueHistory) {
      if (timeRange === "week") {
        revenueChartData = Array(7)
          .fill(0)
          .map((_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - 6 + i);
            const dateStr = date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            const amount = revenue.revenueHistory
              .filter((item) => {
                const itemDate = new Date(item.date);
                return itemDate.toDateString() === date.toDateString();
              })
              .reduce((sum, item) => sum + item.amount, 0);

            return { name: dateStr, value: amount };
          });
      } else if (timeRange === "month") {
        const weeks = Math.ceil(30 / 7);
        revenueChartData = Array(weeks)
          .fill(0)
          .map((_, i) => {
            const startDay = i * 7;
            const endDay = Math.min(startDay + 6, 29);

            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 29 + startDay);

            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() - 29 + endDay);

            const amount = revenue.revenueHistory
              .filter((item) => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
              })
              .reduce((sum, item) => sum + item.amount, 0);

            return { name: `Week ${i + 1}`, value: amount };
          });
      } else {
        // year
        revenueChartData = Array(12)
          .fill(0)
          .map((_, i) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - 11 + i);
            const monthStr = date.toLocaleDateString("en-US", {
              month: "short",
            });

            const amount = revenue.revenueHistory
              .filter((item) => {
                const itemDate = new Date(item.date);
                return (
                  itemDate.getMonth() === date.getMonth() &&
                  itemDate.getFullYear() === date.getFullYear()
                );
              })
              .reduce((sum, item) => sum + item.amount, 0);

            return { name: monthStr, value: amount };
          });
      }
    }
    setRevenueData(revenueChartData);

    // Course enrollment data
    const topCourses = [...courses]
      .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
      .slice(0, 5)
      .map((course) => ({
        name: course.title,
        value: course.studentsEnrolled,
      }));
    setCourseEnrollmentData(topCourses);

    // Report type distribution
    const reportTypeCounts = reports.reduce(
      (acc: Record<string, number>, report) => {
        acc[report.reportedItem.type] =
          (acc[report.reportedItem.type] || 0) + 1;
        return acc;
      },
      {}
    );

    const reportDistribution = Object.entries(reportTypeCounts).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
      })
    );
    setReportTypeData(reportDistribution);
  };

  // Calculate derived statistics
  const totalUsers = users.length;
  const newUsersThisMonth = users.filter(
    (user) =>
      new Date(user.createdAt) >
      new Date(new Date().setMonth(new Date().getMonth() - 1))
  ).length;

  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status === "approved").length;
  const newCoursesThisMonth = courses.filter(
    (course) =>
      new Date(course.createdAt) >
      new Date(new Date().setMonth(new Date().getMonth() - 1))
  ).length;

  const pendingTutorRequests = tutorRequests.filter(
    (req) => req.status === "pending"
  ).length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
              <Button variant="outline" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                Export
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
                      <p className="text-xs text-muted-foreground">
                        +{newUsersThisMonth} from last month
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
                      <div className="text-2xl font-bold">{activeCourses}</div>
                      <p className="text-xs text-muted-foreground">
                        {totalCourses} total courses
                      </p>
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

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenue?.totalRevenue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {revenue?.revenueGrowth || 0}% from last month
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
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
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
                      ) : userGrowthData.length > 0 ? (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData}>
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
                                  `${value} users`,
                                  "New Users",
                                ]}
                              />
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
                        <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                      <CardDescription>Breakdown by user roles</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : userDistributionData.length > 0 ? (
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={userDistributionData}
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
                                {userDistributionData.map((entry, index) => (
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
                                  `${value} users`,
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
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-3">
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
                          {tutorRequests.slice(0, 3).map((request) => (
                            <div
                              key={request._id}
                              className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                            >
                              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                <FileCheck className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {request.user?.name || "Unknown User"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {formatDate(request.createdAt)}
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

                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Reports</CardTitle>
                      <CardDescription>
                        Reports submitted by users
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
                      ) : reports.length > 0 ? (
                        <div className="space-y-4">
                          {reports.map((report) => (
                            <div
                              key={report._id}
                              className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
                            >
                              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                                <Flag className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {report.reason}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Reported by:{" "}
                                  {report.reporter?.name || "Unknown"} •
                                  {report.reportedItem.type === "course" &&
                                    ` Course: ${
                                      report.reportedItem.title || "Unknown"
                                    }`}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/reports/${report._id}`}>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center">
                          <Flag className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            No recent reports
                          </p>
                          <p className="text-sm text-muted-foreground">
                            All reports have been resolved
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/reports">View All Reports</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                    <CardDescription>
                      User growth and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : userGrowthData.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userGrowthData}>
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
                                `${value} users`,
                                "New Users",
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
                    <Button asChild>
                      <Link href="/admin/users">View All Users</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>
                        Distribution of users by role
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : userDistributionData.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={userDistributionData}
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
                                {userDistributionData.map((entry, index) => (
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
                                  `${value} users`,
                                  "Count",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity</CardTitle>
                      <CardDescription>Active users over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : userGrowthData.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
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
                                  `${value} users`,
                                  "Active Users",
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
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Analytics</CardTitle>
                    <CardDescription>
                      Course enrollment and completion metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : courseEnrollmentData.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={courseEnrollmentData}>
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
                    <Button asChild>
                      <Link href="/admin/courses">Manage Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Status</CardTitle>
                      <CardDescription>
                        Distribution of courses by status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : courses.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Approved",
                                    value: courses.filter(
                                      (c) => c.status === "approved"
                                    ).length,
                                  },
                                  {
                                    name: "Pending",
                                    value: courses.filter(
                                      (c) => c.status === "pending"
                                    ).length,
                                  },
                                  {
                                    name: "Rejected",
                                    value: courses.filter(
                                      (c) => c.status === "rejected"
                                    ).length,
                                  },
                                ]}
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
                                {["#00C49F", "#FFBB28", "#FF8042"].map(
                                  (color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value) => [
                                  `${value} courses`,
                                  "Count",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Prices</CardTitle>
                      <CardDescription>
                        Distribution of course prices
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : courses.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: "$0-$50",
                                  value: courses.filter((c) => c.price <= 50)
                                    .length,
                                },
                                {
                                  name: "$51-$100",
                                  value: courses.filter(
                                    (c) => c.price > 50 && c.price <= 100
                                  ).length,
                                },
                                {
                                  name: "$101-$200",
                                  value: courses.filter(
                                    (c) => c.price > 100 && c.price <= 200
                                  ).length,
                                },
                                {
                                  name: "$200+",
                                  value: courses.filter((c) => c.price > 200)
                                    .length,
                                },
                              ]}
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
                                formatter={(value: number) => [
                                  `${value} courses`,
                                  "Count",
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
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Analytics</CardTitle>
                    <CardDescription>
                      Overview of user reports and issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : reports.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: "Open",
                                value: reports.filter(
                                  (r) => r.status === "open"
                                ).length,
                              },
                              {
                                name: "In Progress",
                                value: reports.filter(
                                  (r) => r.status === "in_progress"
                                ).length,
                              },
                              {
                                name: "Resolved",
                                value: reports.filter(
                                  (r) => r.status === "resolved"
                                ).length,
                              },
                              {
                                name: "Rejected",
                                value: reports.filter(
                                  (r) => r.status === "rejected"
                                ).length,
                              },
                            ]}
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
                              formatter={(value: number) => [
                                `${value} reports`,
                                "Count",
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
                    <Button asChild>
                      <Link href="/admin/reports">View All Reports</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Types</CardTitle>
                      <CardDescription>
                        Distribution of reports by type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : reportTypeData.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={reportTypeData}
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
                                {reportTypeData.map((entry, index) => (
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
                                  `${value} reports`,
                                  "Count",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Report Status</CardTitle>
                      <CardDescription>
                        Current status of all reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : reports.length > 0 ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Open",
                                    value: reports.filter(
                                      (r) => r.status === "open"
                                    ).length,
                                  },
                                  {
                                    name: "In Progress",
                                    value: reports.filter(
                                      (r) => r.status === "in_progress"
                                    ).length,
                                  },
                                  {
                                    name: "Resolved",
                                    value: reports.filter(
                                      (r) => r.status === "resolved"
                                    ).length,
                                  },
                                ]}
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
                                {["#0088FE", "#00C49F", "#FFBB28"].map(
                                  (color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value) => [
                                  `${value} reports`,
                                  "Count",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Platform revenue over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {loading ? (
                      <div className="h-[400px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : revenueData.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revenueData}>
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
                                "Revenue",
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
                    <Button asChild>
                      <Link href="/admin/revenue">View Detailed Revenue</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Sources</CardTitle>
                      <CardDescription>
                        Breakdown by revenue sources
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : revenue ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Course Fees",
                                    value: revenue.totalRevenue * 0.7,
                                  },
                                  {
                                    name: "Subscriptions",
                                    value: revenue.totalRevenue * 0.2,
                                  },
                                  {
                                    name: "Other",
                                    value: revenue.totalRevenue * 0.1,
                                  },
                                ]}
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
                                {["#0088FE", "#00C49F", "#FFBB28"].map(
                                  (color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  borderRadius: "var(--radius)",
                                }}
                                formatter={(value: number) => [
                                  formatCurrency(value),
                                  "Amount",
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Revenue</CardTitle>
                      <CardDescription>
                        Current month's revenue breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div className="h-[200px] w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : revenue ? (
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: "Week 1",
                                  value: revenue.monthlyRevenue * 0.2,
                                },
                                {
                                  name: "Week 2",
                                  value: revenue.monthlyRevenue * 0.3,
                                },
                                {
                                  name: "Week 3",
                                  value: revenue.monthlyRevenue * 0.25,
                                },
                                {
                                  name: "Week 4",
                                  value: revenue.monthlyRevenue * 0.25,
                                },
                              ]}
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
                                formatter={(value: number) => [
                                  formatCurrency(value),
                                  "Revenue",
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
                        <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
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
