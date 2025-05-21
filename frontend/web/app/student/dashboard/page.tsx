"use client"

import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  GraduationCap,
  LineChart,
  Search,
  Star,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"

interface Course {
  _id: string
  title: string
  description: string
  tutor: {
    _id: string
    name: string
    email: string
  }
  pricing: {
    online: {
      price: number
    }
    group: {
      price: number
    }
    oneOnOne: {
      price: number
    }
  }
  modules: Array<{
    _id: string
    title: string
    sections: Array<{
      _id: string
      title: string
    }>
  }>
}

interface Enrollment {
  _id: string
  student: string
  course: Course
  currentStatus: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
  progress: {
    completionPercentage: number
    timeSpentTotal: number
    modules: Array<{
      moduleId: string
      status: 'not_started' | 'started' | 'completed'
      timeSpent: number
      sections: Array<{
        sectionId: string
        status: 'not_started' | 'in_progress' | 'completed'
        timeSpent: number
      }>
    }>
  }
  certification?: {
    eligible: boolean
    issued: boolean
    certificateId?: string
  }
  activityLog?: Array<{
    action: string
    details: any
    timestamp: string
  }>
  enrollmentDate: string
}

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    inProgressCourses: 0,
    completedCourses: 0,
    upcomingSessions: 0,
    certificatesEarned: 0,
    hoursStudied: 0,
    hoursThisMonth: 0,
    completedModules: 0,
    completedSections: 0,
  })
  const [studentName, setStudentName] = useState('')

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // First fetch student info
        const studentData = JSON.parse(localStorage.getItem('user') || '{}');
        setStudentName(studentData.name || '');
  
        const token = localStorage.getItem('token');
  
        const enrollmentsRes = await fetch('http://localhost:5000/api/enrollment/mycourses', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!enrollmentsRes.ok) {
          console.error('Error fetching enrollments');
          return;
        }
        
        const fetchedEnrollments = await enrollmentsRes.json();
        console.log('Fetched enrollments:', fetchedEnrollments); // Debug log
        
        setEnrollments(fetchedEnrollments);
  
        // Calculate stats based on the enrollment data
        const enrolledCourses = fetchedEnrollments.length;
        const inProgressCourses = fetchedEnrollments.filter(
          (e: Enrollment) => e.currentStatus === 'in_progress'
        ).length;
        const completedCourses = fetchedEnrollments.filter(
          (e: Enrollment) => e.currentStatus === 'completed'
        ).length;
        const certificatesEarned = fetchedEnrollments.filter(
          (e: Enrollment) => e.certification?.issued
        ).length;
        
        // Calculate time spent in hours
        const hoursStudied = Math.round(
          fetchedEnrollments.reduce((acc: number, e: Enrollment) =>
            acc + (e.progress?.timeSpentTotal || 0), 0) / 3600
        );
        
        // Calculate time spent this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const hoursThisMonth = Math.round(
          fetchedEnrollments.reduce((acc: number, e: Enrollment) => {
            const enrollmentDate = new Date(e.enrollmentDate);
            if (enrollmentDate.getMonth() === currentMonth && enrollmentDate.getFullYear() === currentYear) {
              return acc + (e.progress?.timeSpentTotal || 0) / 3600;
            }
            return acc;
          }, 0)
        );
        
        // Calculate completed modules and sections
        const completedModules = fetchedEnrollments.reduce((acc: number, e: Enrollment) => 
          acc + (e.progress?.modules?.filter((m: { status: string }) => m.status === 'completed').length || 0), 0);
        
        const completedSections = fetchedEnrollments.reduce((acc: number, e: Enrollment) => 
          acc + (e.progress?.modules?.reduce((modAcc: number, mod: Enrollment['progress']['modules'][number]) => 
            modAcc + (mod.sections?.filter((s: Enrollment['progress']['modules'][number]['sections'][number]) => s.status === 'completed').length || 0), 0) || 0), 0);

        setStats({
          enrolledCourses,
          inProgressCourses,
          completedCourses,
          upcomingSessions: 0, // You'll need to implement this based on activityLog
          certificatesEarned,
          hoursStudied,
          hoursThisMonth,
          completedModules,
          completedSections
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading dashboard...</div>
      </div>
    );
  }
  
  if (!Array.isArray(enrollments)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Error loading enrollments data</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {studentName}</p>
            </div>
            <Button asChild>
              <Link href="/student/explore">
                <Search className="mr-2 h-4 w-4" />
                Explore Courses
              </Link>
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.inProgressCourses} in progress, {stats.completedCourses} completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedModules} modules</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedSections} sections completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.certificatesEarned > 0 ? "View your certificates" : "Complete courses to earn certificates"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.hoursStudied}</div>
                  <p className="text-xs text-muted-foreground">
                    This month: {stats.hoursThisMonth} hours
                  </p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList>
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="progress">Learning Progress</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="courses" className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No courses enrolled yet</p>
                    <p className="text-muted-foreground mb-4">Explore our courses to get started</p>
                    <Button asChild>
                      <Link href="/student/explore">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {enrollments.map((enrollment) => {
                        const course = enrollment.course
                        const completedModules = enrollment.progress?.modules?.filter(m => m.status === 'completed').length || 0
                        const totalModules = course.modules?.length || 0

                        return (
                          <Card key={enrollment._id}>
                            <CardHeader className="p-0">
                              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                <div className="flex items-center justify-center h-full">
                                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  {/* <span>Tutor: {course.tutor.name}</span> */}
                                  <div className="flex items-center">
                                    <span>${course.pricing.online.price}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{enrollment.progress.completionPercentage}%</span>
                                  </div>
                                  <Progress
                                    value={enrollment.progress.completionPercentage}
                                    className="h-2"
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Modules: {completedModules}/{totalModules}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Status: {enrollment.currentStatus.replace('_', ' ')}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                              <Button variant="outline" className="w-full" asChild>
                                <Link href={`/student/course/${course._id}`}>
                                  {enrollment.currentStatus === 'completed' ? 'View Course' : 'Continue Learning'}
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        )
                      })}
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" asChild>
                        <Link href="/student/my-courses">View All Courses</Link>
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>Track your progress across all courses</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                      <LineChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Time Spent</CardTitle>
                      <CardDescription>Your learning activity across courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enrollments.map((enrollment) => {
                          const course = enrollment.course
                          const hours = Math.round(enrollment.progress.timeSpentTotal / 3600)
                          return (
                            <div key={enrollment._id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{course.title}</span>
                                <span>{hours} hours</span>
                              </div>
                              <Progress
                                value={Math.min(hours, 100)}
                                className="h-2 bg-primary"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Completion</CardTitle>
                      <CardDescription>Your progress towards completing courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enrollments.map((enrollment) => {
                          const course = enrollment.course
                          return (
                            <div key={enrollment._id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{course.title}</span>
                                <span>{enrollment.progress.completionPercentage}%</span>
                              </div>
                              <Progress
                                value={enrollment.progress.completionPercentage}
                                className={`h-2 ${enrollment.currentStatus === 'completed' ?
                                    'bg-green-500' : 'bg-primary'
                                  }`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Your scheduled sessions for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No upcoming sessions</p>
                      <p className="text-muted-foreground">Your scheduled sessions will appear here</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/student/schedule">View Full Schedule</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Courses</CardTitle>
                    <CardDescription>Based on your interests and learning history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Advanced Web Development",
                          tutor: "Alex Johnson",
                          rating: 4.8,
                          students: 850,
                          price: "$59.99",
                        },
                        {
                          title: "JavaScript Frameworks",
                          tutor: "Maria Garcia",
                          rating: 4.7,
                          students: 720,
                          price: "$49.99",
                        },
                        {
                          title: "Backend Development",
                          tutor: "David Kim",
                          rating: 4.9,
                          students: 930,
                          price: "$69.99",
                        },
                      ].map((course, i) => (
                        <div key={i} className="flex items-center">
                          <div className="h-16 w-16 rounded-md overflow-hidden mr-4 bg-muted">
                            <img
                              src={`/placeholder.svg?height=64&width=64&text=${i + 1}`}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {course.tutor} • {course.rating} ★ • {course.students} students
                            </p>
                            <p className="text-sm font-medium">{course.price}</p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/student/explore/${i + 1}`}>Enroll</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/student/explore">Explore More Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}