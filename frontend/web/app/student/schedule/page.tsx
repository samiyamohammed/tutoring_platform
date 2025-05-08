'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/student-sidebar';

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  courseTitle: string;
  tutorName: string;
  category: string;
  level: string;
  deadline: string;
  currentStatus: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || !user._id) throw new Error('Not authenticated');

        const res = await fetch(`http://localhost:5000/api/enrollment/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrollments = await res.json();
        const allSessions: Schedule[] = [];

        enrollments.forEach((enrollment: any) => {
          const course = enrollment.course;
          const tutorName = course?.tutor?.name || 'Unknown Tutor';

          const pushSchedule = (list: any[], type: string) => {
            if (!list) return;
            list.forEach((s: any) => {
              allSessions.push({
                day: s.day,
                startTime: s.startTime,
                endTime: s.endTime,
                sessionType: type,
                courseTitle: course.title,
                tutorName,
                category: course.category,
                level: course.level,
                deadline: course.deadline,
                currentStatus: enrollment.currentStatus,

              });
            });
          };

          pushSchedule(course?.pricing?.online?.schedule, 'Online');
          pushSchedule(course?.pricing?.group?.schedule, 'Group');
          pushSchedule(course?.pricing?.oneOnOne?.schedule, 'One-on-One');
        });

        setSchedules(allSessions);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col p-6">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold">Full Schedule</h1>
            <p className="text-muted-foreground text-sm">
              All upcoming sessions from your enrolled courses.
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sessions found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((session, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{session.courseTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      <strong>Category:</strong> {session.category} | <strong>Level:</strong> {session.level}
                    </div>
                    <div><strong>Tutor:</strong> {session.tutorName}</div>
                    <div>
                      <strong>Session:</strong> {session.sessionType} • {session.day}, {session.startTime} - {session.endTime}
                    </div>
                    <div><strong>Deadline:</strong> {format(new Date(session.deadline), 'PPP')}</div>
                    <div><strong>Status:</strong> {session.currentStatus}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
