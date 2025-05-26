"use client"

import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  GraduationCap,
  // LineChart,
  Search,
  Star,
  List, Video 
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,Line, XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,BarChart,Bar,
} from "recharts";

import {
  SessionCard,
  CalendarView,
  getUpcomingSessions,
} from "@/components/student-tabs/schedule"



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
  category?: string;
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [courses, setCourses] = useState<any[]>([]);

  const progressData = enrollments.map(enrollment => ({
    course: enrollment.course.title,
    completion: enrollment.progress?.completionPercentage || 0,
    hours: Math.round((enrollment.progress?.timeSpentTotal || 0) / 3600)
  }))

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

        // Fetch courses data
      const coursesRes = await fetch('http://localhost:5000/api/courses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (coursesRes.ok) {
        const fetchedCourses = await coursesRes.json();
        setCourses(fetchedCourses);
      }

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

                {/* learning progress */}

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>Track your progress across all courses</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                     {progressData.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No enrolled courses yet.
                      </div>
                    ) : (
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={progressData} margin={{ left: 20, right: 20, top: 20, bottom: 40 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="course" 
                                interval={0} 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60} 
                              />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="completion" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                name="Completion %"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
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

              {/* sessions */}
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Upcoming Sessions</CardTitle>
                        <CardDescription>Your scheduled sessions for the next 7 days</CardDescription>
                        <CardDescription>
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} -{' '}
                          {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setViewMode('calendar')}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Calendar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                 
                  <CardContent>
                    {enrollments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">No enrolled courses</p>
                        <p className="text-muted-foreground">Enroll in courses to see scheduled sessions</p>
                      </div>
                    ) : viewMode === 'calendar' ? (
                      <CalendarView
                        sessions={getUpcomingSessions(enrollments)}
                        onClose={() => setViewMode('list')}
                      />

                    ) : (
                      <div className="space-y-4">
                        {getUpcomingSessions(enrollments).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">No sessions this week</p>
                            <p className="text-muted-foreground">Your scheduled sessions will appear here</p>
                          </div>
                        ) : (
                          getUpcomingSessions(enrollments).map((session) => (
                            <SessionCard key={`${session.courseId}-${session.day}-${session.startTime}`} session={session} />
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/student/schedule">View Full Schedule</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* reccommendations */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Courses</CardTitle>
                    <CardDescription>Based on your interests and learning history</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const enrolledCourseIds = enrollments.map((e) => e.course._id);
                        const enrolledCategories = enrollments.map((e) => e.course.category);
                        
                        const recommendedCourses = courses.filter((course) => 
                          !enrolledCourseIds.includes(course._id) && enrolledCategories.includes(course.category)
                        );

                        return recommendedCourses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Star className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">No recommendations yet</p>
                            <p className="text-muted-foreground">Enroll in more courses to get personalized recommendations</p>
                          </div>
                        ) : (
                          recommendedCourses.map((course, idx) => (
                            <div key={idx} className="flex items-center">
                              <div className="h-16 w-16 rounded-md overflow-hidden mr-4 bg-muted">
                                <img
                                  src={`/placeholder.svg?height=64&width=64&text=${idx + 1}`}
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{course.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {course.tutor.name} • {course.rating || 'N/A'}  • {course.students || 0} students
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {course.category} • {course.level}
                                </p>
                                <p className="text-sm font-medium">
                                  ETB{course.pricing?.online?.price || 0}
                                </p>
                              </div>
                              
                            </div>
                          ))
                        );
                      })()}
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