'use client';

import { Calendar, ChevronRight, List, Video, Clock } from "lucide-react";
import { addDays, isToday, isTomorrow, format } from "date-fns";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface Props {
  enrollments: any[];
}


type SessionStatus = 'upcoming' | 'in-progress' | 'completed';

const statusColors: Record<SessionStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
};

const getNextDayDate = (dayName: string) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = daysOfWeek.indexOf(dayName);

  if (targetIndex === -1) return null;

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;

  return addDays(today, diff);
};

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/enrollment/mycourses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const sessions = enrollments.flatMap((enrollment) => {
    const { course } = enrollment;
    const sessionList: any[] = [];

    const pushSessions = (scheduleList: any[], type: string) => {
      if (scheduleList?.length > 0) {
        sessionList.push(...scheduleList.map((s) => ({
          ...s,
          sessionType: type,
          tutor: course.tutor.name,
          courseTitle: course.title,
          courseId: course._id
        })));
      }
    };

    pushSessions(course.pricing?.online?.schedule, 'Online');
    pushSessions(course.pricing?.group?.schedule, 'Group');
    pushSessions(course.pricing?.oneOnOne?.schedule, 'One-on-One');

    return sessionList.map((session) => {
      const nextDate = getNextDayDate(session.day);
      if (!nextDate) return null;

      const [hour, minute] = session.startTime.split(':').map(Number);
      const startDateTime = new Date(nextDate);
      startDateTime.setHours(hour, minute);

      const now = new Date();
      let status: SessionStatus;
      const endDateTime = new Date(startDateTime);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMin);

      if (now > endDateTime) {
        status = 'completed';
      } else if (now >= startDateTime && now <= endDateTime) {
        status = 'in-progress';
      } else {
        status = 'upcoming';
      }

      return { 
        ...session, 
        nextDate, 
        startDateTime,
        status,
        date: nextDate,
        tutorName: session.tutor,
        endTime: session.endTime
      };
    }).filter(Boolean);
  }).sort((a, b) => a!.startDateTime - b!.startDateTime);

  function calculateDuration(startTime: string, endTime: string): string {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

 function SessionCard({ session }: { session: any }) {
  return (
    <div className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`flex-shrink-0 p-3 rounded-lg ${statusColors[session.status as SessionStatus]}`}>
        <Calendar className="h-6 w-6" />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{session.courseTitle}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[session.status as SessionStatus]}`}>
              {session.status.replace('-', ' ')}
            </span>
            <span className="text-sm text-muted-foreground">
              {isToday(session.nextDate) ? "Today" :
                isTomorrow(session.nextDate) ? "Tomorrow" :
                  format(session.nextDate, 'EEEE, MMM d')}, {session.startTime} - {session.endTime}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {session.sessionType} Session with {session.tutorName}
        </p>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Duration: {calculateDuration(session.startTime, session.endTime)}</span>
        </div>
      </div>
    </div>
  );
}


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading schedule...</div>
      </div>
    );
  }

  return (

     <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
            <div className="flex items-center border-b px-4 py-3 pb-4">
              <CardTitle >Full Schedule</CardTitle>
          </div>

            <div className="container mx-auto py-8">
                <Card>
                  
                    <CardContent>
                      {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium mb-2">No scheduled sessions</p>
                          <p className="text-muted-foreground">
                            Your sessions will appear here when scheduled.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 py-4">
                          {sessions.map((session, idx) => (
                            <SessionCard key={idx} session={session} />
                          ))}
                        </div>
                      )}
                    </CardContent>

                </Card>
            </div>
        
        </main>
        </div>
     </SidebarProvider>

  );
}
