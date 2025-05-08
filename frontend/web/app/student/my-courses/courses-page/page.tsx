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
import { Skeleton } from "@/components/ui/skeleton"

import { useEffect, useState } from "react"

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user._id;

      if (!token || !studentId) {
        throw new Error('No token or student ID found');
      }

      const enrollResponse = await fetch(`http://localhost:5000/api/enrollment/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!enrollResponse.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollmentData = await enrollResponse.json();
      setEnrollments(enrollmentData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="border-b px-4 py-3">
            <h1 className="text-lg font-semibold">My Courses</h1>
            <p className="text-sm text-muted-foreground">Continue learning</p>
          </div>

          {loading ? (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-[180px] w-full rounded-t-lg" />
                  <CardContent className="space-y-2 p-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="text-destructive">
                <p className="font-medium">Error loading courses</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchEnrollments}>
                Try Again
              </Button>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No courses enrolled yet</p>
              <p className="text-sm text-muted-foreground">
                Get started by exploring our course catalog
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((e) => (
                <Card key={e._id}>
                  <CardHeader className="p-0">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src="/placeholder.svg" 
                        alt={e.course.title} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="line-clamp-1 font-bold">{e.course.title}</div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Tutor: {e.course.tutor.name}</span>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{e.progress?.completionPercentage || 0}%</span>
                        </div>
                        <Progress value={e.progress?.completionPercentage || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/student/my-courses/course-detail/${e.course._id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}