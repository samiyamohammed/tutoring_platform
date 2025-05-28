"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, X, List, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  tutor: User;
  pricing: {
    online?: {
      price: number;
      maxStudents: number;
      schedule: {
        day: string;
        startTime: string;
        endTime: string;
      }[];
    };
    group?: {
      price: number;
      maxStudents: number;
      schedule: {
        day: string;
        startTime: string;
        endTime: string;
      }[];
    };
    oneOnOne?: {
      price: number;
      maxStudents: number;
      schedule: {
        day: string;
        startTime: string;
        endTime: string;
      }[];
    };
  };
  sessionTypes: string[];
}

interface Enrollment {
  _id: string;
  course: Course;
  enrolledSessionType: string;
}

interface Session {
  _id: string;
  student: User;
  tutor: User;
  course: Course;
  sessionType: "video" | "in-person" | "group" | "oneOnOne";
  status: "pending" | "approved" | "declined" | "completed";
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  videoConferenceLink?: string;
  notes?: string;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function StudentSessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sessions");
  const [calendarView, setCalendarView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);
  const [filter, setFilter] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
    sessionFormat: "all",
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/enrollment/mycourses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch enrollments");
      }

      const oneOnOneEnrollments = data.filter(
        (enrollment: Enrollment) =>
          enrollment.enrolledSessionType === "oneOnOne"
      );

      setEnrollments(oneOnOneEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to fetch enrollments");
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/session/student`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        setSessions(data);
        setFilteredSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  useEffect(() => {
    let result = [...sessions];

    if (filter.status !== "all") {
      result = result.filter((session) => session.status === filter.status);
    }

    if (filter.type !== "all") {
      result = result.filter((session) => {
        if (filter.type === "group") return session.sessionType === "group";
        if (filter.type === "oneOnOne")
          return session.sessionType === "oneOnOne";
        return true;
      });
    }

    if (filter.sessionFormat !== "all") {
      result = result.filter((session) => {
        if (filter.sessionFormat === "online")
          return session.sessionType === "video";
        if (filter.sessionFormat === "in-person")
          return session.sessionType === "in-person";
        return true;
      });
    }

    if (filter.dateRange !== "all") {
      const now = new Date();
      result = result.filter((session) => {
        const sessionDate = new Date(session.scheduledDate);
        switch (filter.dateRange) {
          case "upcoming":
            return sessionDate >= now;
          case "past":
            return sessionDate < now;
          case "today":
            return (
              sessionDate.getDate() === now.getDate() &&
              sessionDate.getMonth() === now.getMonth() &&
              sessionDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key.includes(".")) {
          const keys = sortConfig.key.split(".");
          aValue = keys.reduce((obj: any, key) => obj?.[key], a);
          bValue = keys.reduce((obj: any, key) => obj?.[key], b);
        } else {
          aValue = a[sortConfig.key as keyof Session];
          bValue = b[sortConfig.key as keyof Session];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    fetchEnrollments();
    setFilteredSessions(result);
  }, [filter, sessions, sortConfig]);

  const handleOpenBookingModal = async () => {
    setShowBookingModal(true);
    await fetchEnrollments();
  };

  const getAvailableTimeSlots = () => {
    if (!selectedCourse) return [];

    const oneOnOneSchedule = selectedCourse.pricing.oneOnOne?.schedule || [];

    // Group by day
    const scheduleByDay: Record<
      string,
      Array<{ startTime: string; endTime: string }>
    > = {};

    oneOnOneSchedule.forEach((slot) => {
      if (!scheduleByDay[slot.day]) {
        scheduleByDay[slot.day] = [];
      }
      scheduleByDay[slot.day].push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    });

    return scheduleByDay;
  };

  const renderScheduleSelection = () => {
    const scheduleByDay = getAvailableTimeSlots() as Record<
      string,
      { startTime: string; endTime: string }[]
    >;
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (Object.keys(scheduleByDay).length === 0) {
      return (
        <div className="col-span-4 text-sm text-muted-foreground">
          No schedule available for this course
        </div>
      );
    }

    return (
      <div className="col-span-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daysOfWeek.map((day) => {
            if (!scheduleByDay[day]) return null;

            return (
              <div key={day} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{day}</h3>
                <div className="space-y-2">
                  {scheduleByDay[day].map((slot, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedTimeSlot ===
                          `${slot.startTime} - ${slot.endTime}` &&
                        selectedDate === day
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTimeSlot(
                          `${slot.startTime} - ${slot.endTime}`
                        );
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {selectedTimeSlot ===
                          `${slot.startTime} - ${slot.endTime}` &&
                          selectedDate === day && (
                            <span className="text-primary">✓ Selected</span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleBookSession = async () => {
    if (!selectedCourse || !selectedDate || !selectedTimeSlot) {
      toast.error("Please select a course, day and time slot");
      return;
    }

    try {
      setBookingLoading(true);
      const [startTime, endTime] = selectedTimeSlot.split(" - ");

      const response = await fetch(`${baseUrl}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          course: selectedCourse._id,
          tutor: selectedCourse.tutor._id,
          sessionType: "oneOnOne",
          scheduledDate: selectedDate,
          startTime,
          endTime,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book session");
      }

      toast.success("Session request submitted successfully");

      const sessionsResponse = await fetch(`${baseUrl}/api/session/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);

      setSelectedCourse(null);
      setSelectedDate("");
      setSelectedTimeSlot("");
      setShowBookingModal(false);
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("Failed to book session");
    } finally {
      setBookingLoading(false);
    }
  };

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel session");
      }

      toast.success("Session request cancelled successfully");
      setSessions(sessions.filter((session) => session._id !== id));
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    }
  };

  const handleStartSession = (session: Session) => {
    const now = new Date();
    const sessionStart = session.startTime
      ? new Date(session.startTime)
      : new Date(session.scheduledDate);
    const sessionEnd = session.endTime
      ? new Date(session.endTime)
      : new Date(sessionStart.getTime() + 60 * 60 * 1000);

    if (session.sessionType === "video") {
      if (now >= sessionStart && now <= sessionEnd) {
        router.push(`/student/video-session/${session._id}`);
      } else if (now < sessionStart) {
        const timeUntil = Math.floor(
          (sessionStart.getTime() - now.getTime()) / 1000 / 60
        );
        toast.message(`Session will start in ${timeUntil} minutes`);
      } else {
        toast.message("This session has already ended");
      }
    } else {
      router.push(`/session/${session._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRange = (startDate: string, endDate: string) => {
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSessionTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      video: "Online",
      "in-person": "In-Person",
      group: "Group",
      oneOnOne: "1-on-1",
    };
    return typeMap[type] || type;
  };

  const pendingRequests = sessions.filter(
    (session) => session.status === "pending"
  );
  const upcomingSessions = filteredSessions.filter((session) =>
    ["approved", "pending"].includes(session.status)
  );

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">My Sessions</h1>
              <p className="text-sm text-muted-foreground">
                Manage your learning sessions
              </p>
            </div>
            <div className="flex space-x-2">
              {enrollments.length > 0 && (
                <Dialog
                  open={showBookingModal}
                  onOpenChange={setShowBookingModal}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleOpenBookingModal}
                    >
                      <Calendar size={16} />
                      Book New Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Book a New 1-on-1 Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="course" className="text-right">
                          Course
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            const course = enrollments.find(
                              (e) => e.course._id === value
                            )?.course;
                            setSelectedCourse(course || null);
                            setSelectedDate("");
                            setSelectedTimeSlot("");
                          }}
                          value={selectedCourse?._id || ""}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {enrollments.map((enrollment) => (
                              <SelectItem
                                key={enrollment.course._id}
                                value={enrollment.course._id}
                              >
                                {enrollment.course.title} -{" "}
                                {enrollment.course.tutor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCourse && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                              Available Sessions
                            </Label>
                            {renderScheduleSelection()}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBookingModal(false)}
                      >
                        Cancel
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleBookSession}
                              disabled={
                                !selectedCourse ||
                                !selectedDate ||
                                !selectedTimeSlot ||
                                bookingLoading
                              }
                            >
                              {bookingLoading ? "Booking..." : "Book Session"}
                            </Button>
                          </TooltipTrigger>
                          {(!selectedDate || !selectedTimeSlot) && (
                            <TooltipContent>
                              <p>Please select a day and time slot</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
                <TabsTrigger value="requests">My Requests</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 items-center mb-4">
              <select
                className="p-2 border rounded text-sm"
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="all">All Session Types</option>
                <option value="group">Group</option>
                <option value="oneOnOne">1-on-1</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.sessionFormat}
                onChange={(e) =>
                  setFilter({ ...filter, sessionFormat: e.target.value })
                }
              >
                <option value="all">All Formats</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.dateRange}
                onChange={(e) =>
                  setFilter({ ...filter, dateRange: e.target.value })
                }
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
              </select>
            </div>

            {calendarView ? (
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    View your sessions in a calendar format
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    Calendar view will be implemented here
                  </div>
                </CardContent>
              </Card>
            ) : activeTab === "requests" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Session Requests</CardTitle>
                  <CardDescription>
                    Your pending session requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : pendingRequests.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("tutor.name")}
                          >
                            <div className="flex items-center">
                              Tutor
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("course.title")}
                          >
                            <div className="flex items-center">
                              Course
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("scheduledDate")}
                          >
                            <div className="flex items-center">
                              Date
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell>{request.tutor.name}</TableCell>
                            <TableCell>{request.course.title}</TableCell>
                            <TableCell>
                              {formatDate(request.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {request.startTime && request.endTime
                                ? formatTimeRange(
                                    request.startTime,
                                    request.endTime
                                  )
                                : formatTime(request.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {getSessionTypeDisplay(request.sessionType)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleStatusChange(request._id)}
                              >
                                <X size={16} className="mr-1" />
                                Cancel Request
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending session requests
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>
                    Your scheduled learning sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : upcomingSessions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("tutor.name")}
                          >
                            <div className="flex items-center">
                              Tutor
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("course.title")}
                          >
                            <div className="flex items-center">
                              Course
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("scheduledDate")}
                          >
                            <div className="flex items-center">
                              Date
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingSessions.map((session) => (
                          <TableRow key={session._id}>
                            <TableCell>{session.tutor.name}</TableCell>
                            <TableCell>{session.course.title}</TableCell>
                            <TableCell>
                              {formatDate(session.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {session.startTime && session.endTime
                                ? formatTimeRange(
                                    session.startTime,
                                    session.endTime
                                  )
                                : formatTime(session.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {getSessionTypeDisplay(session.sessionType)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(session.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {session.status === "approved" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleStartSession(session)}
                                    disabled={
                                      session.sessionType === "video" &&
                                      (new Date() <
                                        new Date(
                                          session.startTime ||
                                            session.scheduledDate
                                        ) ||
                                        new Date() >
                                          new Date(
                                            session.endTime ||
                                              new Date(
                                                session.scheduledDate
                                              ).getTime() + 3600000
                                          ))
                                    }
                                  >
                                    {session.sessionType === "video" ? (
                                      new Date() <
                                      new Date(
                                        session.startTime ||
                                          session.scheduledDate
                                      ) ? (
                                        <>
                                          <Clock className="mr-2 h-4 w-4" />
                                          Starts at{" "}
                                          {formatTime(
                                            session.startTime ||
                                              session.scheduledDate
                                          )}
                                        </>
                                      ) : new Date() >
                                        new Date(
                                          session.endTime ||
                                            new Date(
                                              session.scheduledDate
                                            ).getTime() + 3600000
                                        ) ? (
                                        "Session Ended"
                                      ) : (
                                        "Join Video Session"
                                      )
                                    ) : (
                                      "View Session Details"
                                    )}
                                  </Button>
                                )}
                                {session.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(session._id)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming sessions found
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
