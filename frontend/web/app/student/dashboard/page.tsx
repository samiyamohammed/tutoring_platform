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

import  DashboardStats  from "@/components/ui/studentdash/tabs/DashboardStats"
import { MyCourses } from "@/components/ui/studentdash/tabs/MyCourses"
import { Schedule } from "@/components/ui/studentdash/tabs/Schedule"
import {Recommendations} from "@/components/ui/studentdash/tabs/Recommendations"
import {LearningProgress} from "@/components/ui/studentdash/tabs/LearningProgress"

import { useState,useEffect } from "react"

interface User {
  _id: string;
  name: string;
  email: string;
}
interface Enrollment {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    description: string;
    tutor: {
      _id: string;
      name: string;
      email: string;
    };
    pricing: {
      online?: {
        price?: number;
        schedule: Array<{
          day: string;
          startTime: string;
          endTime: string;
          _id: string;
        }>;
      };
      group?: {
        price?: number;
        schedule: Array<{
          day: string;
          startTime: string;
          endTime: string;
          _id: string;
        }>;
      };
      oneOnOne?: {
        price?: number;
        schedule: Array<{
          day: string;
          startTime: string;
          endTime: string;
          _id: string;
        }>;
      };
    };
    sessionTypes: string[];
    level: string;
    category: string;
    createdAt: string;
    deadline: string;
  };
  enrolledSessionType: string;
  currentStatus: string;
  enrollmentDate: string;
  progress: {
    completionPercentage: number;
    timeSpentTotal: number;
    modules: any[];
    assessments: any[];
    sessions: any[];
  };
  payment: {
    totalAmount: number;
    amountPaid: number;
    status: string;
    transactions: any[];
  };
  certification: {
    issued: boolean;
    requirementsMet: string[];
  };
}


export default function StudentDashboardPage() {

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);


useEffect(() => {
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user._id;

      if (!token || !studentId) {
        throw new Error('No token or student ID found');
      }

      setUser(typeof user === 'string' ? JSON.parse(user) : user);

      // fetch enrollments
      const enrollResponse = await fetch(`http://localhost:5000/api/enrollment/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!enrollResponse.ok) {
        throw new Error('Failed to fetch enrollments');
      }



      const enrollmentData = await enrollResponse.json();
      console.log("enrollment data", enrollmentData);
      setEnrollments(enrollmentData);

      // fetch all courses
      const courseResponse = await fetch('http://localhost:5000/api/course/',{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch courses');
      }

      const courseData = await courseResponse.json();
      console.log("course data", courseData);
      setCourses(courseData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchEnrollments();
}, []);



  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar /> 
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Student'}</p>
            </div>
            <Button asChild>
              <Link href="/student/explore">
                <Search className="mr-2 h-4 w-4" />
                Explore Courses
              </Link>
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="">
              <DashboardStats enrollments={enrollments} loading={loading} />
            </div>
            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList>
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="progress">Learning Progress</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* my course */} 
              <TabsContent value="courses" className="space-y-4">
                <MyCourses enrollments={enrollments} />
              </TabsContent>

               {/* Learning progress tab */}

              <TabsContent value="progress" className="space-y-4"> 
                <LearningProgress enrollments={enrollments} />
                {/* <Card>
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
                </div> */}
              </TabsContent>

                {/* schedule */}
                <TabsContent value="schedule" className="space-y-4">
                  <Schedule enrollments={enrollments} />
                </TabsContent>

              {/* recommendations */}
              <TabsContent value="recommendations" className="space-y-4">
                <Recommendations enrollments={enrollments} courses={courses} />
              </TabsContent>
      
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
