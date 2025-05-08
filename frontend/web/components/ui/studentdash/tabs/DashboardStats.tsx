import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, GraduationCap, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  startTime: string | Date;
  endTime: string | Date;
  _id: string;
}

interface Enrollment {
  _id: string;
  currentStatus: 'in-progress' | 'completed' | string;
  progress: {
    sessions: Session[];
    timeSpentTotal: number;
  };
  certification: {
    issued: boolean;
  };
  course: {
    title: string;
  };
}

interface DashboardStatsProps {
  enrollments: Enrollment[];
  loading?: boolean;
}

export default function DashboardStats({ enrollments, loading = false }: DashboardStatsProps) {
  // Calculate stats
  const enrolledCoursesCount = loading ? 0 : enrollments.length;
  const inProgressCourses = loading ? 0 : enrollments.filter((e) => e.currentStatus === 'in-progress').length;
  const completedCourses = loading ? 0 : enrollments.filter((e) => e.currentStatus === 'completed').length;
  
  const upcomingSessions = loading ? 0 : enrollments.filter((e) => {
    return e.progress.sessions?.some((session: Session) => {
      const sessionTime = new Date(session.startTime);
      return sessionTime > new Date();
    });
  }).length;

  const certificatesEarned = loading ? 0 : enrollments.filter((e) => e.certification?.issued).length;
  const totalHoursStudied = loading ? 0 : enrollments.reduce((total, e) => total + (e.progress?.timeSpentTotal || 0), 0);

  // Format next session time
  const nextSessionTime = loading ? 'Today at 4:00 PM' : 
    enrollments.flatMap(e => e.progress.sessions || [])
      .filter(s => new Date(s.startTime) > new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]
      ?.startTime || null;

  // Get latest certificate title
  const latestCertificate = loading ? 'Web Development Fundamentals' : 
    enrollments.find(e => e.certification?.issued)?.course?.title || 'None';

//   if (loading) {
//     return (
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <Card key={i}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <Skeleton className="h-4 w-[100px]" />
//               <Skeleton className="h-4 w-4" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-8 w-[50px] mb-1" />
//               <Skeleton className="h-3 w-[120px]" />
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     );
//   }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrolledCoursesCount}</div>
          <p className="text-xs text-muted-foreground">
            {inProgressCourses} in progress, {completedCourses} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingSessions}</div>
          <p className="text-xs text-muted-foreground">
            {nextSessionTime ? `Next: ${new Date(nextSessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No upcoming sessions'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{certificatesEarned}</div>
          <p className="text-xs text-muted-foreground">Latest: {latestCertificate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHoursStudied}</div>
          <p className="text-xs text-muted-foreground">
            This month: {Math.round(totalHoursStudied * 0.4)} hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}