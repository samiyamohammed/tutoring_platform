"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ResponsiveContainer
} from 'recharts'
import { SidebarProvider } from "@/components/ui/sidebar"

// Types based on your schema
type Course = {
  _id: string
  title: string
  currentEnrollment: number
  status: 'pending' | 'approved' | 'rejected'
  pricing: {
    online?: { price: number }
    group?: { price: number }
    oneOnOne?: { price: number }
  }
}

type Enrollment = {
  _id: string
  course: Course
  enrolledSessionType: 'online' | 'group' | 'oneOnOne'
  currentStatus: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
  progress: {
    completionPercentage: number
  }
  payment: {
    amountPaid: number
    totalAmount: number
  }
}

type Session = {
  _id: string
  course: {
    title: string
  }
  sessionType: 'video' | 'in-person'
  scheduledDate: string
  status: 'pending' | 'approved' | 'declined'
}

type DashboardStats = {
  totalStudents: number
  activeCourses: number
  upcomingSessions: number
  totalEarnings: number
  changeFromLastMonth: {
    students: number
    courses: number
    earnings: number
  }
}

type ChartData = {
  name: string
  value: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function TutorDashboardPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [enrollmentData, setEnrollmentData] = useState<ChartData[]>([])
  const [performanceData, setPerformanceData] = useState<ChartData[]>([])
  const [earningsData, setEarningsData] = useState<ChartData[]>([])
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data from your API endpoints
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Set up headers with authorization
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Make parallel API calls with authentication
        const [coursesRes, enrollmentsRes, sessionsRes] = await Promise.all([
          fetch(`${apiUrl}/api/course`, { headers }),
          fetch(`${apiUrl}/api/enrollment`, { headers }),
          fetch(`${apiUrl}/api/session`, { headers })
        ]);

        if (!coursesRes.ok || !enrollmentsRes.ok || !sessionsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [coursesData, enrollmentsData, sessionsData] = await Promise.all([
          coursesRes.json(),
          enrollmentsRes.json(),
          sessionsRes.json()
        ])

        setCourses(coursesData)
        setEnrollments(enrollmentsData)
        setSessions(sessionsData)

        // Calculate stats
        const activeStudents = enrollmentsData.filter(
          (e: Enrollment) => ['enrolled', 'in_progress'].includes(e.currentStatus)
        ).length

        const activeCourses = coursesData.filter(
          (c: Course) => c.status === 'approved'
        ).length

        const upcomingSessions = sessionsData.filter(
          (s: Session) => s.status === 'approved'
        ).length

        const totalEarnings = enrollmentsData.reduce(
          (sum: number, e: Enrollment) => sum + (e.payment?.amountPaid || 0), 0
        )

        // Mock change from last month (in a real app, you'd compare with previous data)
        const mockStats: DashboardStats = {
          totalStudents: activeStudents,
          activeCourses: activeCourses,
          upcomingSessions: upcomingSessions,
          totalEarnings: totalEarnings,
          changeFromLastMonth: {
            students: 14,
            courses: 2,
            earnings: 18
          }
        }

        // Generate chart data based on time range
        let mockEnrollmentData: ChartData[] = []
        let mockEarningsData: ChartData[] = []

        if (timeRange === 'week') {
          mockEnrollmentData = [
            { name: 'Mon', value: 12 },
            { name: 'Tue', value: 19 },
            { name: 'Wed', value: 15 },
            { name: 'Thu', value: 22 },
            { name: 'Fri', value: 18 },
            { name: 'Sat', value: 10 },
            { name: 'Sun', value: 8 }
          ]

          mockEarningsData = [
            { name: 'Mon', value: 420 },
            { name: 'Tue', value: 680 },
            { name: 'Wed', value: 550 },
            { name: 'Thu', value: 790 },
            { name: 'Fri', value: 720 },
            { name: 'Sat', value: 380 },
            { name: 'Sun', value: 310 }
          ]
        } else if (timeRange === 'month') {
          mockEnrollmentData = [
            { name: 'Week 1', value: 45 },
            { name: 'Week 2', value: 68 },
            { name: 'Week 3', value: 72 },
            { name: 'Week 4', value: 89 }
          ]

          mockEarningsData = [
            { name: 'Week 1', value: 1580 },
            { name: 'Week 2', value: 2420 },
            { name: 'Week 3', value: 2750 },
            { name: 'Week 4', value: 3120 }
          ]
        } else { // year
          mockEnrollmentData = [
            { name: 'Jan', value: 30 },
            { name: 'Feb', value: 45 },
            { name: 'Mar', value: 60 },
            { name: 'Apr', value: 80 },
            { name: 'May', value: 100 },
            { name: 'Jun', value: 125 },
            { name: 'Jul', value: 110 },
            { name: 'Aug', value: 95 },
            { name: 'Sep', value: 130 },
            { name: 'Oct', value: 150 },
            { name: 'Nov', value: 170 },
            { name: 'Dec', value: 200 }
          ]

          mockEarningsData = [
            { name: 'Jan', value: 1250 },
            { name: 'Feb', value: 1870 },
            { name: 'Mar', value: 2420 },
            { name: 'Apr', value: 3250 },
            { name: 'May', value: 4120 },
            { name: 'Jun', value: 4870 },
            { name: 'Jul', value: 4320 },
            { name: 'Aug', value: 3980 },
            { name: 'Sep', value: 5120 },
            { name: 'Oct', value: 5870 },
            { name: 'Nov', value: 6420 },
            { name: 'Dec', value: 7250 }
          ]
        }

        // Generate performance data based on actual course completion
        const mockPerformanceData = coursesData.map((course: Course) => ({
          name: course.title,
          value: enrollmentsData
            .filter((e: Enrollment) => e.course._id === course._id)
            .reduce((sum: number, e: Enrollment) => sum + (e.progress?.completionPercentage || 0), 0) /
            Math.max(1, enrollmentsData.filter((e: Enrollment) => e.course._id === course._id).length)
        }))

        setStats(mockStats)
        setEnrollmentData(mockEnrollmentData)
        setPerformanceData(mockPerformanceData)
        setEarningsData(mockEarningsData)
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
    )
  }

  return (
    <SidebarProvider>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading your data..." : "Welcome back, Tutor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange} disabled={loading}>
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
            Array(4).fill(0).map((_, i) => (
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
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.changeFromLastMonth.students > 0 ? '+' : ''}
                    {stats.changeFromLastMonth.students}% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.changeFromLastMonth.courses} new this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    {sessions[0] ? `Next: ${formatDate(sessions[0].scheduledDate)}` : 'No upcoming sessions'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.changeFromLastMonth.earnings > 0 ? '+' : ''}
                    {stats.changeFromLastMonth.earnings}% from last month
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
                    {timeRange === 'week' ? 'Last 7 days' :
                      timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'}
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
                        <LineChart
                          data={enrollmentData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }}
                            formatter={(value) => [`${value} students`, 'Enrollments']}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
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
                  <CardTitle>Course Popularity</CardTitle>
                  <CardDescription>Most enrolled courses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {loading ? (
                    <div className="h-[300px] w-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : performanceData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={performanceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {performanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }}
                            formatter={(value) => [`${value}%`, 'Average Score']}
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
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled sessions for the next 7 days</CardDescription>
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
                      {sessions.slice(0, 3).map((session) => (
                        <div key={session._id} className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors">
                          <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{session.course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.scheduledDate)} • {session.sessionType}
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
                      <p className="text-sm font-medium">No upcoming sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule new sessions to see them here
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/tutor/schedule">
                      View All Sessions
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>Average scores across your courses</CardDescription>
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
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }}
                            formatter={(value) => [`${value}%`, 'Average Score']}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                <CardDescription>Track how students are engaging with your courses</CardDescription>
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
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }}
                          formatter={(value) => [`${value} students`, 'Active Students']}
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
                <CardDescription>Track your students' progress across all courses</CardDescription>
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
                    {enrollments.slice(0, 5).map((enrollment) => (
                      <div key={enrollment._id} className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarFallback>
                            {enrollment._id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">Student {enrollment._id.slice(-4)}</p>
                            <p className="text-sm font-medium">{enrollment.progress.completionPercentage}%</p>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${enrollment.progress.completionPercentage > 80 ? 'bg-green-500' :
                                  enrollment.progress.completionPercentage > 60 ? 'bg-primary' : 'bg-yellow-500'
                                }`}
                              style={{ width: `${enrollment.progress.completionPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {enrollment.course.title} • {enrollment.enrolledSessionType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center">
                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">No students enrolled yet</p>
                    <p className="text-sm text-muted-foreground">
                      Share your courses to get students
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tutor/students">
                    View All Students
                  </Link>
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
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)' }}
                          formatter={(value) => [formatCurrency(Number(value)), 'Earnings']}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
    </div>
    </SidebarProvider>
  )
}