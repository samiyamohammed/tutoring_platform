'use client';

import { Calendar, ChevronRight } from "lucide-react";
import { addDays, isToday, isTomorrow, format } from "date-fns";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  enrollments: any[];
}

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

export function Schedule({ enrollments }: Props) {
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

      return { ...session, nextDate, startDateTime };
    }).filter((session) => {
      if (!session) return false;
      const today = new Date();
      const sevenDaysLater = addDays(today, 7);
      return session.startDateTime >= today && session.startDateTime <= sevenDaysLater;
    });
  }).sort((a, b) => a.startDateTime - b.startDateTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>Sessions scheduled within the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No upcoming sessions found.
            </div>
          ) : (
            sessions.map((session, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{session.courseTitle} - {session.sessionType} Session</p>
                  <p className="text-sm text-muted-foreground">
                    {isToday(session.nextDate) ? "Today" :
                     isTomorrow(session.nextDate) ? "Tomorrow" :
                     format(session.nextDate, 'EEEE, MMM d')}, {session.startTime} - {session.endTime} • {session.tutor}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/student/schedule">View Full Schedule</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
