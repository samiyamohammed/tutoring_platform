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

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboardPage() {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Jane Doe</p>
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
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">2 in progress, 2 completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Next: Today at 4:00 PM</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Latest: Web Development Fundamentals</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">This month: 18 hours</p>
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Advanced JavaScript",
                      progress: 75,
                      image: "/placeholder.svg?height=100&width=200",
                      tutor: "John Smith",
                      nextSession: "Tomorrow, 2:00 PM",
                    },
                    {
                      title: "UI/UX Design Principles",
                      progress: 45,
                      image: "/placeholder.svg?height=100&width=200",
                      tutor: "Sarah Johnson",
                      nextSession: "Friday, 10:00 AM",
                    },
                    {
                      title: "Python for Data Science",
                      progress: 20,
                      image: "/placeholder.svg?height=100&width=200",
                      tutor: "Michael Brown",
                      nextSession: "Monday, 3:00 PM",
                    },
                  ].map((course, i) => (
                    <Card key={i}>
                      <CardHeader className="p-0">
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Tutor: {course.tutor}</span>
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                              <span>4.8</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          <div className="text-sm text-muted-foreground">Next session: {course.nextSession}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/student/my-courses/${i + 1}`}>Continue Learning</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/student/my-courses">View All Courses</Link>
                  </Button>
                </div>
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
                      <CardTitle>Assessment Scores</CardTitle>
                      <CardDescription>Your performance in course assessments</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Goals</CardTitle>
                      <CardDescription>Track your progress towards your learning goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { goal: "Complete JavaScript Course", progress: 75 },
                          { goal: "Finish 5 Programming Projects", progress: 40 },
                          { goal: "Study 50 Hours This Month", progress: 60 },
                        ].map((goal, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{goal.goal}</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        ))}
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
                    <div className="space-y-4">
                      {[
                        {
                          title: "Advanced JavaScript - Group Session",
                          time: "Today, 4:00 PM - 6:00 PM",
                          tutor: "John Smith",
                        },
                        {
                          title: "UI/UX Design - One-on-One Session",
                          time: "Tomorrow, 2:00 PM - 3:00 PM",
                          tutor: "Sarah Johnson",
                        },
                        {
                          title: "Python for Data Science - Group Session",
                          time: "Friday, 10:00 AM - 12:00 PM",
                          tutor: "Michael Brown",
                        },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center">
                          <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.time} • {session.tutor}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                          title: "React.js for Beginners",
                          tutor: "John Smith",
                          rating: 4.9,
                          students: 1245,
                          price: "$49.99",
                        },
                        {
                          title: "Advanced CSS and Sass",
                          tutor: "Sarah Johnson",
                          rating: 4.8,
                          students: 987,
                          price: "$39.99",
                        },
                        {
                          title: "Machine Learning Fundamentals",
                          tutor: "Michael Brown",
                          rating: 4.7,
                          students: 1532,
                          price: "$59.99",
                        },
                      ].map((course, i) => (
                        <div key={i} className="flex items-center">
                          <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
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
                          <Button size="sm">Enroll</Button>
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
