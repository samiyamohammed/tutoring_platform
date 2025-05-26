// student-schedule.tsx

import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import Link from "next/link"

export interface Session {
  courseId: string;
  courseTitle: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: 'online' | 'group' | 'oneOnOne';
  tutorName: string;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface CourseScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

export function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getNextDateForDay(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.indexOf(dayName.toLowerCase());
  if (dayIndex === -1) return new Date();
  const today = new Date();
  const todayIndex = today.getDay();
  let daysToAdd = dayIndex - todayIndex;
  if (daysToAdd < 0) daysToAdd += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate;
}

export function getUpcomingSessions(enrollments: any[]): Session[] {
  const sessions: Session[] = [];
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  enrollments.forEach((enrollment) => {
    const sessionType = enrollment.enrolledSessionType as 'online' | 'group' | 'oneOnOne';
    const courseSchedule = enrollment.course.pricing[sessionType]?.schedule || [];

    courseSchedule.forEach((scheduleItem: CourseScheduleItem) => {
      const sessionDate = getNextDateForDay(scheduleItem.day);
      if (sessionDate >= today && sessionDate <= nextWeek) {
        const now = new Date();
        const [startHour, startMin] = scheduleItem.startTime.split(':').map(Number);
        const [endHour, endMin] = scheduleItem.endTime.split(':').map(Number);
        const startTime = new Date(sessionDate);
        startTime.setHours(startHour, startMin);
        const endTime = new Date(sessionDate);
        endTime.setHours(endHour, endMin);

        let status: Session['status'];
        if (now > endTime) status = 'completed';
        else if (now >= startTime && now <= endTime) status = 'in-progress';
        else status = 'upcoming';

        sessions.push({
          courseId: enrollment.course._id,
          courseTitle: enrollment.course.title,
          day: scheduleItem.day,
          date: sessionDate.toISOString(),
          startTime: scheduleItem.startTime,
          endTime: scheduleItem.endTime,
          sessionType,
          tutorName: enrollment.course.tutor.name,
          status
        });
      }
    });
  });

  return sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
}

export function SessionCard({ session }: { session: Session }) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`flex-shrink-0 p-3 rounded-lg ${statusColors[session.status]}`}>
        <Calendar className="h-6 w-6" />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{session.courseTitle}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[session.status]}`}>
              {session.status.replace('-', ' ')}
            </span>
            <span className="text-sm text-muted-foreground">
              {session.day}, {session.startTime} - {session.endTime}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {session.sessionType === 'oneOnOne' ? '1-on-1 Session' :
            session.sessionType === 'group' ? 'Group Session' : 'Online Session'} with {session.tutorName}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Duration: {calculateDuration(session.startTime, session.endTime)}</span>
          </div>
          {session.sessionType === 'online' && session.status === 'upcoming' && (
            <Button variant="outline" size="sm" className="ml-4">
              <Video className="h-4 w-4 mr-2" />
              Join Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


interface CalendarViewProps {
  sessions: Session[];
  onClose: () => void; 
}

export function CalendarView({ sessions, onClose }: CalendarViewProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Exit Button */}
      <div className="flex justify-end px-4 pt-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Exit Calendar View
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b">
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="p-2 text-center font-medium border-r last:border-r-0">
            <div className="text-sm">{days[date.getDay()]}</div>
            <div className={`text-lg rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
              date.toDateString() === today.toDateString() ? 'bg-primary text-primary-foreground' : ''
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[200px]">
        {weekDates.map((date) => {
          const daySessions = sessions.filter(
            (s) => s.day.toLowerCase() === days[date.getDay()].toLowerCase()
          )

          return (
            <div key={date.toISOString()} className="p-2 border-r last:border-r-0">
              {daySessions.length > 0 ? (
                <div className="space-y-2">
                  {daySessions.map((session) => (
                    <div key={`${session.courseId}-${session.startTime}`} className="p-2 text-xs border rounded hover:bg-muted/50 cursor-pointer">
                      <div className="font-medium truncate">{session.courseTitle}</div>
                      <div>{session.startTime}-{session.endTime}</div>
                      {session.sessionType === 'online' && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No sessions
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
