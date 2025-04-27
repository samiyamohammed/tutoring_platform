'use client';

import { format, addDays, isToday, isTomorrow, parse } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Helper to get next occurrence of a day
const getNextDayDate = (dayName: string) => {
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = daysOfWeek.indexOf(dayName);

  if (targetIndex === -1) return null; // Invalid day

  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7; // Next week

  return addDays(today, diff);
};

<TabsContent value="schedule" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Sessions</CardTitle>
      <CardDescription>Sessions scheduled within the next 7 days</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {enrollments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No upcoming sessions found.
          </div>
        ) : (
          enrollments.flatMap((enrollment) => {
            const { course } = enrollment;
            const sessions: any[] = [];

            const pushSessions = (scheduleList: any[], type: string) => {
              if (scheduleList?.length > 0) {
                sessions.push(...scheduleList.map((s) => ({
                  ...s,
                  sessionType: type,
                  tutor: course.tutor.name,
                  courseTitle: course.title
                })));
              }
            };

            pushSessions(course.pricing?.online?.schedule, 'Online');
            pushSessions(course.pricing?.group?.schedule, 'Group');
            pushSessions(course.pricing?.oneOnOne?.schedule, 'One-on-One');

            return sessions.map((session) => {
              const nextDate = getNextDayDate(session.day);
              if (!nextDate) return null;

              // Build datetime for sorting
              const startTimeParts = session.startTime.split(':');
              const startDateTime = new Date(nextDate);
              startDateTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]));

              return {
                ...session,
                nextDate,
                startDateTime,
              };
            }).filter((session) => {
              if (!session) return false;
              const today = new Date();
              const sevenDaysLater = addDays(today, 7);
              return session.startDateTime >= today && session.startDateTime <= sevenDaysLater;
            });
          }).flat().sort((a, b) => a.startDateTime - b.startDateTime) // Sort sessions ascending
            .map((session, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{session.courseTitle} - {session.sessionType} Session</p>
                  <p className="text-sm text-muted-foreground">
                    {isToday(session.nextDate) ? "Today" :
                     isTomorrow(session.nextDate) ? "Tomorrow" :
                     format(session.nextDate, 'EEEE, MMM d')}
                    , {session.startTime} - {session.endTime} • {session.tutor}
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
</TabsContent>
